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

export const llmGatewayResponseSchema = z.object({
  reply: z.string().min(1),
  metadata: z
    .object({
      traceId: z.string().optional(),
      locale: localeSchema.default('ru'),
      promptTokens: z.number().int().nonnegative().optional(),
      completionTokens: z.number().int().nonnegative().optional()
    })
    .default({ locale: 'ru' })
});

export type LlmGatewayResponse = z.infer<typeof llmGatewayResponseSchema>;
