import { Role } from '@aidvokat/contracts';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsIn(['ru', 'uz'])
  locale: 'ru' | 'uz' = 'ru';

  @IsIn(['user', 'admin'])
  @IsOptional()
  role: Role = 'user';
}
