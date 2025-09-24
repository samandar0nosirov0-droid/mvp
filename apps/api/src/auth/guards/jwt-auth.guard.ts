import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: unknown, user: RequestUser | false) {
    if (err || !user) {
      throw err || new UnauthorizedException('Необходима авторизация');
    }
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
