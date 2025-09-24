import { randomUUID } from 'node:crypto';
import { BadRequestException, Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { loginSchema, registerSchema } from '@aidvokat/contracts';

type RequestWithCookies = Request & { cookies?: Record<string, string> };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Некорректные данные',
        issues: parseResult.error.issues
      });
    }

    const anonSessionId = this.ensureAnonCookie(request, response);
    const result = await this.authService.register(body, anonSessionId);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const parseResult = loginSchema.safeParse({ ...body, locale: body.locale ?? 'ru' });
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Некорректные данные',
        issues: parseResult.error.issues
      });
    }

    const anonSessionId = this.ensureAnonCookie(request, response);
    const result = await this.authService.login(body, anonSessionId);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  @Post('refresh')
  async refresh(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    const anonSessionId = this.ensureAnonCookie(request, response);
    const result = await this.authService.refresh(refreshToken, anonSessionId);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  @Post('logout')
  async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken ?? null;
    await this.authService.logout(refreshToken);
    this.clearAuthCookies(response);

    return { success: true };
  }

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const commonOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProd,
      path: '/'
    };
    const accessTtlMs = this.getAccessCookieMaxAge();
    const refreshTtlMs = this.getRefreshCookieMaxAge();

    response.cookie('accessToken', accessToken, {
      ...commonOptions,
      maxAge: accessTtlMs
    });
    response.cookie('refreshToken', refreshToken, {
      ...commonOptions,
      maxAge: refreshTtlMs
    });
  }

  private clearAuthCookies(response: Response) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const commonOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProd,
      path: '/'
    };
    response.clearCookie('accessToken', commonOptions);
    response.clearCookie('refreshToken', commonOptions);
  }

  private getAccessCookieMaxAge() {
    const fallback = 15 * 60 * 1000; // 15 минут
    const configured = this.configService.get<string>('JWT_ACCESS_COOKIE_MAX_AGE');
    if (!configured) {
      return fallback;
    }
    const parsed = Number(configured);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private getRefreshCookieMaxAge() {
    const fallback = 7 * 24 * 60 * 60 * 1000;
    const configured = this.configService.get<string>('JWT_REFRESH_COOKIE_MAX_AGE');
    if (!configured) {
      return fallback;
    }
    const parsed = Number(configured);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private ensureAnonCookie(request: RequestWithCookies, response: Response) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const maxAge = this.getAnonCookieMaxAge();
    const existing = request.cookies?.anon_session_id;

    if (existing) {
      response.cookie('anon_session_id', existing, {
        httpOnly: false,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge
      });
      return existing;
    }

    const anonId = randomUUID();
    response.cookie('anon_session_id', anonId, {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge
    });
    return anonId;
  }

  private getAnonCookieMaxAge() {
    const fallback = 30 * 24 * 60 * 60 * 1000; // 30 дней
    const configured = this.configService.get<string>('ANON_SESSION_COOKIE_MAX_AGE');
    if (!configured) {
      return fallback;
    }
    const parsed = Number(configured);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
