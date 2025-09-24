import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  locale?: 'ru' | 'uz';
}
