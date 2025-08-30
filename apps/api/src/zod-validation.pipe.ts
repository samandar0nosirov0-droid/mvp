import {PipeTransform, ArgumentMetadata, BadRequestException} from '@nestjs/common';
import {ZodSchema} from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema<any>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (!this.schema) return value;
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return result.data;
  }
}
