import { z } from 'zod';
import { localeSchema, uuidSchema } from './common';

export const feedbackMetadataSchema = z.record(z.string(), z.string()).optional();

export const feedbackCreateSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, { message: 'Сообщение должно содержать минимум 10 символов' })
    .max(1000, { message: 'Сообщение не должно превышать 1000 символов' }),
  rating: z
    .number({ invalid_type_error: 'Оценка должна быть числом' })
    .int({ message: 'Оценка должна быть целым числом' })
    .min(1, { message: 'Минимальная оценка — 1' })
    .max(5, { message: 'Максимальная оценка — 5' })
    .optional(),
  locale: localeSchema.default('ru'),
  metadata: feedbackMetadataSchema,
  caseId: uuidSchema.optional()
});

export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
