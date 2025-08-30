import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { AnyZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = metadata.metatype as AnyZodObject | undefined;
    if (schema && typeof (schema as any).parse === 'function') {
      try {
        return (schema as AnyZodObject).parse(value);
      } catch (e) {
        throw new BadRequestException((e as Error).message);
      }
    }
    return value;
  }
}
