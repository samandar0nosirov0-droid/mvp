import { z } from 'zod';
import { localeSchema, uuidSchema } from './common';

export const caseCategorySchema = z.enum([
  'family',
  'labor',
  'civil',
  'administrative',
  'other'
]);

export const caseCreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  category: caseCategorySchema,
  language: localeSchema,
  metadata: z
    .record(z.string(), z.string())
    .default({})
    .transform((value) =>
      Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== ''))
    )
});

export type CaseCreateInput = z.infer<typeof caseCreateSchema>;

export const caseIdParamSchema = z.object({
  id: uuidSchema
});

export type CaseIdParam = z.infer<typeof caseIdParamSchema>;
