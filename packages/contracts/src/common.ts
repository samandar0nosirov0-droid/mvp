import { z } from 'zod';

export const roleSchema = z.enum(['user', 'admin_registered', 'admin_full']);
export type Role = z.infer<typeof roleSchema>;

export const localeSchema = z.enum(['ru', 'uz']);
export type Locale = z.infer<typeof localeSchema>;

export const uuidSchema = z
  .string()
  .uuid({ message: 'Неверный формат идентификатора' });

export const timestampSchema = z.coerce.date();
