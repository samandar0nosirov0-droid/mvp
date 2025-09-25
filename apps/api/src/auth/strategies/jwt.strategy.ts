import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestUser } from '../../common/interfaces/request-with-user.interface';
import { UsersService } from '../../users/users.service';
import { Role } from '@aidvokat/contracts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.accessToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret')
    });
  }

  async validate(payload: { sub: string }): Promise<RequestUser> {
    const user = await this.usersService.findById(payload.sub);
    const sanitized = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      locale: user.locale as 'ru' | 'uz'
    } satisfies RequestUser;

    return sanitized;
  }
}
