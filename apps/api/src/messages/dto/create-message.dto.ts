import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MessageCreateInput, messageRoleSchema } from '@aidvokat/contracts';

const roles = messageRoleSchema.options as readonly string[];

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;

  @IsOptional()
  @IsIn(roles)
  role?: MessageCreateInput['role'];

  @IsOptional()
  @IsIn(['ru', 'uz'])
  locale?: MessageCreateInput['locale'];
}
