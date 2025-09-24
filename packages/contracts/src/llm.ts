import { z } from 'zod';
import { localeSchema } from './common';

export const llmPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(5, { message: 'Запрос должен содержать минимум 5 символов' })
    .max(2000, { message: 'Запрос слишком длинный' }),
  locale: localeSchema.default('ru'),
  context: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']).default('user'),
        content: z.string().min(1)
      })
    )
    .max(20)
    .optional()
});

export type LlmPromptInput = z.infer<typeof llmPromptSchema>;
