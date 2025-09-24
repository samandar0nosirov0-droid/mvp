import { z } from 'zod';
import { localeSchema } from './common';

export const signInSchema = z.object({
  email: z.string().email({ message: 'Укажите корректный email' }),
  password: z.string().min(8, { message: 'Пароль должен содержать минимум 8 символов' }),
  locale: localeSchema.default('ru')
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema
  .extend({
    fullName: z.string().min(2, { message: 'Укажите имя полностью' }).max(120),
    confirmPassword: z.string().min(8)
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Пароли должны совпадать'
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
