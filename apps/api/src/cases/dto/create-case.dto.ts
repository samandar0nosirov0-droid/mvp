import { IsIn, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CaseCreateInput, caseCategorySchema } from '@aidvokat/contracts';

const categories = caseCategorySchema.options as readonly string[];

export class CreateCaseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  description!: string;

  @IsIn(categories)
  category!: CaseCreateInput['category'];

  @IsIn(['ru', 'uz'])
  language!: CaseCreateInput['language'];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}
