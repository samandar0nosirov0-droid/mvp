import { z } from 'zod';
import { localeSchema } from './common';

export const signInSchema = z.object({
  email: z.string().email({ message: 'Укажите корректный email' }),
  password: z.string().min(8, { message: 'Пароль должен содержать минимум 8 символов' }),
  locale: localeSchema.default('ru')
});

export type SignInInput = z.infer<typeof signInSchema>;
