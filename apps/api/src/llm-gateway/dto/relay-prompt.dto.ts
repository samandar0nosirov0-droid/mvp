import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

type MessageRole = 'user' | 'assistant' | 'system';

class PromptContextDto {
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role: MessageRole = 'user';

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class RelayPromptDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  prompt!: string;

  @IsOptional()
  @IsIn(['ru', 'uz'])
  locale?: 'ru' | 'uz';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromptContextDto)
  context?: PromptContextDto[];
}
