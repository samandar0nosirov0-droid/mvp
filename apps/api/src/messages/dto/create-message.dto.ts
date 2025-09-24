import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { MessageCreateInput, messageRoleSchema } from '@aidvokat/contracts';

const roles = messageRoleSchema.options as readonly string[];

export class CreateMessageDto {
  @IsString()
  caseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;

  @IsIn(roles)
  role!: MessageCreateInput['role'];

  @IsIn(['ru', 'uz'])
  locale!: MessageCreateInput['locale'];
}
