import { z } from 'zod';
import { localeSchema, uuidSchema } from './common';

export const messageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const messageCreateSchema = z.object({
  content: z.string().min(1).max(4000),
  role: messageRoleSchema.default('user'),
  locale: localeSchema.default('ru')
});

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;

export const caseMessageCreateSchema = messageCreateSchema.extend({
  caseId: uuidSchema
});

export type CaseMessageCreateInput = z.infer<typeof caseMessageCreateSchema>;
