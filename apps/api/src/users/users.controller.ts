import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get('me')
  @Roles('user', 'admin_registered', 'admin_full')
  getProfile(@Req() request: RequestWithUser) {
    const { user } = request;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      locale: user.locale
    };
  }
}
