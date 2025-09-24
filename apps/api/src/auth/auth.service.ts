import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RequestUser } from '../common/interfaces/request-with-user.interface';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<RequestUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      locale: user.locale as 'ru' | 'uz'
    } satisfies RequestUser;
  }

  async signIn(payload: SignInDto) {
    const user = await this.validateUser(payload.email, payload.password);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role
    });

    return {
      accessToken: token,
      user
    };
  }
}
