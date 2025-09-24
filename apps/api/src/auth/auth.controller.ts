import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { signInSchema } from '@aidvokat/contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    const parseResult = signInSchema.safeParse({ ...body, locale: 'ru' });
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Некорректные данные',
        issues: parseResult.error.issues
      });
    }

    return this.authService.signIn(body);
  }
}
