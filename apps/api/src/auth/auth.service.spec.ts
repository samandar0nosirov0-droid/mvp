import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn()
    } as unknown as UsersService;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { signAsync: jest.fn() } }
      ]
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('rejects invalid credentials', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

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
      locale: 'ru'
    };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
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
});
