import { z } from 'zod';
import { localeSchema, roleSchema, timestampSchema, uuidSchema } from './common';

export const userSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  locale: localeSchema,
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

export type UserContract = z.infer<typeof userSchema>;
