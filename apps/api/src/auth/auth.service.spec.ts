import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bullmq';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';
import { SESSION_CLEANUP_QUEUE } from './auth.constants';

jest.mock('bcryptjs');

const mockConfigService = () => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    switch (key) {
      case 'JWT_ACCESS_SECRET':
        return 'test-access';
      case 'JWT_REFRESH_SECRET':
        return 'test-refresh';
      case 'JWT_ACCESS_EXPIRES_IN':
        return '15m';
      case 'JWT_REFRESH_EXPIRES_IN':
        return '7d';
      case 'JWT_REFRESH_TTL_SECONDS':
        return `${7 * 24 * 60 * 60}`;
      default:
        return defaultValue;
    }
  })
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock };
  let prismaService: PrismaService;
  let prismaSessionMock: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
    deleteMany: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let redisService: {
    storeRefreshTokenHash: jest.Mock;
    getRefreshTokenHash: jest.Mock;
    deleteRefreshTokenHash: jest.Mock;
  };
  let queueMock: { add: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn()
    } as unknown as { findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock };

    prismaSessionMock = {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn()
    };

    prismaService = {
      session: prismaSessionMock
    } as unknown as PrismaService;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn()
    } as unknown as { signAsync: jest.Mock; verifyAsync: jest.Mock };

    redisService = {
      storeRefreshTokenHash: jest.fn(),
      getRefreshTokenHash: jest.fn(),
      deleteRefreshTokenHash: jest.fn()
    };

    queueMock = {
      add: jest.fn(),
      remove: jest.fn()
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: mockConfigService() },
        { provide: RedisService, useValue: redisService },
        { provide: getQueueToken(SESSION_CLEANUP_QUEUE), useValue: queueMock }
      ]
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(authService.validateUser('email@example.com', 'password')).rejects.toThrow(
      'Неверные учетные данные'
    );
  });

  it('returns sanitized user when credentials are valid', async () => {
    const user = {
      id: 'user-1',
      email: 'email@example.com',
      password: 'hashed',
      role: 'user',
      fullName: 'Test User',
      locale: 'ru',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.validateUser(user.email, 'password');
    expect(result).toEqual({
      id: 'user-1',
      email: user.email,
      role: 'user',
      fullName: 'Test User',
      locale: 'ru'
    });
  });

  it('creates a session on login', async () => {
    const user = {
      id: 'user-1',
      email: 'email@example.com',
      password: 'hashed',
      role: 'user',
      fullName: 'Test User',
      locale: 'ru',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z')
    };
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
    jwtService.signAsync.mockResolvedValueOnce('access-token');
    jwtService.signAsync.mockResolvedValueOnce('refresh-token');
    queueMock.remove.mockResolvedValue(undefined);
    queueMock.add.mockResolvedValue(undefined);

    const result = await authService.login({ email: user.email, password: 'password' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(prismaSessionMock.upsert).toHaveBeenCalled();
    expect(redisService.storeRefreshTokenHash).toHaveBeenCalled();
    expect(queueMock.add).toHaveBeenCalled();
  });

  it('refreshes tokens for an active session', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      sid: 'session-1',
      role: 'user',
      type: 'refresh'
    });
    prismaSessionMock.findUnique.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hashed-refresh',
      expiresAt: new Date(Date.now() + 1000),
      anonSessionId: null
    });
    redisService.getRefreshTokenHash.mockResolvedValue('hashed-refresh');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // for refresh token comparison
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'email@example.com',
      fullName: 'Test User',
      role: 'user',
      locale: 'ru',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z')
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    jwtService.signAsync.mockResolvedValueOnce('new-access');
    jwtService.signAsync.mockResolvedValueOnce('new-refresh');
    queueMock.remove.mockResolvedValue(undefined);
    queueMock.add.mockResolvedValue(undefined);

    const result = await authService.refresh('refresh-token');

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(prismaSessionMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'session-1' } })
    );
    expect(redisService.storeRefreshTokenHash).toHaveBeenCalled();
  });

  it('creates a new user on register', async () => {
    usersService.findByEmail.mockResolvedValueOnce(null);
    usersService.create = jest.fn().mockResolvedValue({
      id: 'user-2',
      email: 'new@example.com',
      password: 'hashed',
      role: 'user',
      fullName: 'New User',
      locale: 'ru',
      createdAt: new Date('2024-01-03T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z')
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
    jwtService.signAsync.mockResolvedValueOnce('access');
    jwtService.signAsync.mockResolvedValueOnce('refresh');
    queueMock.remove.mockResolvedValue(undefined);
    queueMock.add.mockResolvedValue(undefined);

    const result = await authService.register({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'New User',
      locale: 'ru'
    });

    expect(result.user.email).toBe('new@example.com');
    expect(usersService.create).toHaveBeenCalled();
    expect(redisService.storeRefreshTokenHash).toHaveBeenCalled();
  });
});
