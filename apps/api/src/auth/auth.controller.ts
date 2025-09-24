import { BadRequestException, Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { signInSchema } from '@aidvokat/contracts';

type RequestWithCookies = Request & { cookies?: Record<string, string> };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('sign-in')
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) response: Response) {
    const parseResult = signInSchema.safeParse({ ...body, locale: 'ru' });
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Некорректные данные',
        issues: parseResult.error.issues
      });
    }

    const result = await this.authService.signIn(body);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  @Post('refresh')
  async refresh(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  @Post('sign-out')
  async signOut(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken ?? null;
    await this.authService.signOut(refreshToken);
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
}
