import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { RequestUser } from '../common/interfaces/request-with-user.interface';
import { Role } from '@aidvokat/contracts';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<RequestUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.sanitizeUser({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      locale: user.locale as 'ru' | 'uz'
    });
  }

  async signIn(payload: SignInDto) {
    const user = await this.validateUser(payload.email, payload.password);
    const tokens = await this.issueTokens(user.id, user.role);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async refresh(refreshToken: string | null | undefined) {
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

    const tokenMatches = await bcrypt.compare(refreshToken, session.tokenHash);
    if (!tokenMatches || session.expiresAt < new Date()) {
      await this.prisma.session.deleteMany({ where: { id: payload.sid } });
      throw new UnauthorizedException('Сессия недействительна');
    }

    const freshUser = await this.usersService.findById(payload.sub);
    const sanitizedUser = this.sanitizeUser({
      id: freshUser.id,
      email: freshUser.email,
      fullName: freshUser.fullName,
      role: freshUser.role as Role,
      locale: freshUser.locale as 'ru' | 'uz'
    });
    const tokens = await this.issueTokens(payload.sub, sanitizedUser.role, payload.sid);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizedUser
    };
  }

  async signOut(refreshToken: string | null | undefined) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sid: string; type?: string }>(refreshToken, {
        secret: this.refreshSecret
      });
      if (payload.type === 'refresh' && payload.sid) {
        await this.prisma.session.deleteMany({ where: { id: payload.sid } });
      }
    } catch (error) {
      // токен уже недействителен — просто игнорируем
    }
  }

  private async issueTokens(userId: string, role: Role, reuseSessionId?: string): Promise<TokenPair> {
    const sessionId = reuseSessionId ?? randomUUID();
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
        lastUsedAt: new Date()
      },
      create: {
        id: sessionId,
        userId,
        tokenHash: hashedRefreshToken,
        expiresAt
      }
    });

    return { accessToken, refreshToken, sessionId };
  }

  private sanitizeUser(user: RequestUser): RequestUser {
    return { ...user };
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
