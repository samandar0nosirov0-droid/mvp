import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = RequestUser>(
    err: unknown,
    user: RequestUser | false,
    ..._rest: unknown[]
  ): TUser {
    void _rest;
    if (err || !user) {
      throw err || new UnauthorizedException('Необходима авторизация');
    }
    return user as TUser;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
