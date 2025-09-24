import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser } from '../common/interfaces/request-with-user.interface';
import { Role, UserContract } from '@aidvokat/contracts';
import { RedisService } from '../common/redis/redis.service';
import { SESSION_CLEANUP_JOB, SESSION_CLEANUP_QUEUE } from './auth.constants';
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

interface IssueTokenOptions {
  reuseSessionId?: string;
  anonSessionId?: string;
}

type UserEntity = {
  id: string;
  email: string;
  fullName: string;
  password: string;
  role: Role;
  locale: 'ru' | 'uz';
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectQueue(SESSION_CLEANUP_QUEUE) private readonly sessionCleanupQueue: Queue
  ) {}

  async register(payload: RegisterDto, anonSessionId?: string) {
    if (payload.password !== payload.confirmPassword) {
      throw new BadRequestException('Пароли должны совпадать');
    }

    const existing = await this.usersService.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const newUser = await this.usersService.create({
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      locale: payload.locale,
      role: 'user'
    });

    const tokens = await this.issueTokens(newUser.id, newUser.role as Role, {
      anonSessionId
    });

    return {
      user: this.toUserContract(newUser),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async login(payload: LoginDto, anonSessionId?: string) {
    const userRecord = await this.usersService.findByEmail(payload.email);
    if (!userRecord) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(payload.password, userRecord.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const tokens = await this.issueTokens(userRecord.id, userRecord.role as Role, {
      anonSessionId
    });

    return {
      user: this.toUserContract(userRecord),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async validateUser(email: string, password: string): Promise<RequestUser> {
    const userRecord = await this.usersService.findByEmail(email);
    if (!userRecord) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(password, userRecord.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.toRequestUser(userRecord);
  }

  async refresh(refreshToken: string | null | undefined, anonSessionId?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    let payload: { sub: string; sid: string; role: Role; type: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret
      });
    } catch (error) {
      throw new UnauthorizedException('Сессия истекла, войдите заново');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Сессия недействительна');
    }

    const session = await this.prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Сессия недействительна');
    }

    const cachedHash = await this.redisService.getRefreshTokenHash(session.id);
    if (!cachedHash) {
      await this.invalidateSession(session.id);
      throw new UnauthorizedException('Сессия недействительна');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, session.tokenHash);
    if (!tokenMatches || session.expiresAt < new Date()) {
      await this.invalidateSession(session.id);
      throw new UnauthorizedException('Сессия недействительна');
    }

    if (cachedHash !== session.tokenHash) {
      await this.invalidateSession(session.id);
      throw new UnauthorizedException('Сессия недействительна');
    }

    const freshUser = await this.usersService.findById(payload.sub);
    const userContract = this.toUserContract(freshUser);
    const tokens = await this.issueTokens(payload.sub, userContract.role, {
      reuseSessionId: session.id,
      anonSessionId: anonSessionId ?? session.anonSessionId ?? undefined
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userContract
    };
  }

  async logout(refreshToken: string | null | undefined) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sid: string; type?: string }>(refreshToken, {
        secret: this.refreshSecret
      });
      if (payload.type === 'refresh' && payload.sid) {
        await this.invalidateSession(payload.sid);
      }
    } catch (error) {
      // токен уже недействителен — просто игнорируем
    }
  }

  private async issueTokens(userId: string, role: Role, options: IssueTokenOptions = {}): Promise<TokenPair> {
    const sessionId = options.reuseSessionId ?? randomUUID();
    const accessTokenTtl = this.accessTtl;
    const refreshTokenTtl = this.refreshTtl;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role, type: 'access' },
        { secret: this.accessSecret, expiresIn: accessTokenTtl }
      ),
      this.jwtService.signAsync(
        { sub: userId, sid: sessionId, role, type: 'refresh' },
        { secret: this.refreshSecret, expiresIn: refreshTokenTtl }
      )
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);

    await this.prisma.session.upsert({
      where: { id: sessionId },
      update: {
        tokenHash: hashedRefreshToken,
        expiresAt,
        lastUsedAt: new Date(),
        ...(options.anonSessionId ? { anonSessionId: options.anonSessionId } : {})
      },
      create: {
        id: sessionId,
        userId,
        tokenHash: hashedRefreshToken,
        expiresAt,
        anonSessionId: options.anonSessionId ?? null
      }
    });

    await this.redisService.storeRefreshTokenHash(sessionId, hashedRefreshToken, this.refreshTtlSeconds);
    await this.scheduleSessionCleanup(sessionId, this.refreshTtlSeconds * 1000);

    return { accessToken, refreshToken, sessionId };
  }

  private async scheduleSessionCleanup(sessionId: string, delayMs: number) {
    try {
      await this.sessionCleanupQueue.remove(sessionId);
    } catch (error) {
      // нет активной задачи — игнорируем
    }

    await this.sessionCleanupQueue.add(
      SESSION_CLEANUP_JOB,
      { sessionId },
      {
        delay: delayMs,
        jobId: sessionId,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1
      }
    );
  }

  private async invalidateSession(sessionId: string) {
    await Promise.all([
      this.prisma.session.deleteMany({ where: { id: sessionId } }),
      this.redisService.deleteRefreshTokenHash(sessionId),
      this.removeCleanupJob(sessionId)
    ]);
  }

  private async removeCleanupJob(sessionId: string) {
    try {
      await this.sessionCleanupQueue.remove(sessionId);
    } catch (error) {
      this.logger.debug(`Очередь очистки: задача ${sessionId} не найдена`);
    }
  }

  private toRequestUser(user: UserEntity): RequestUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      locale: user.locale as 'ru' | 'uz'
    };
  }

  private toUserContract(user: UserEntity): UserContract {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      locale: user.locale as 'ru' | 'uz',
      role: user.role as Role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private get accessSecret() {
    return this.configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret');
  }

  private get refreshSecret() {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret');
  }

  private get accessTtl() {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
  }

  private get refreshTtl() {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  private get refreshTtlSeconds() {
    const configured = this.configService.get<string>('JWT_REFRESH_TTL_SECONDS');
    const fallback = 60 * 60 * 24 * 7;
    if (!configured) {
      return fallback;
    }

    const parsed = Number(configured);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
