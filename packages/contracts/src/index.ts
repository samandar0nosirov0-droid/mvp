import { z } from 'zod';

export const Role = z.enum(['user', 'admin_registered', 'admin_full']);
export type Role = z.infer<typeof Role>;

export const AccountKind = z.enum(['anon', 'regular']);
export type AccountKind = z.infer<typeof AccountKind>;

export const Locale = z.enum(['uz', 'ru', 'en']);
export type Locale = z.infer<typeof Locale>;

export const RegisterAnon = z.object({
  username: z.string(),
  password: z.string(),
  secret_word: z.string()
});
export type RegisterAnon = z.infer<typeof RegisterAnon>;

export const LoginUsername = z.object({
  username: z.string(),
  password: z.string()
});
export type LoginUsername = z.infer<typeof LoginUsername>;

export const RecoverBySecretWord = z.object({
  username: z.string(),
  secret_word: z.string(),
  new_password: z.string()
});
export type RecoverBySecretWord = z.infer<typeof RecoverBySecretWord>;

export const RegisterRegular = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string(),
  username: z.string().optional()
}).refine((d) => d.email || d.phone, {
  message: 'email or phone required',
  path: ['email']
});
export type RegisterRegular = z.infer<typeof RegisterRegular>;

export const LoginRegular = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string()
}).refine((d) => d.email || d.phone, {
  message: 'email or phone required',
  path: ['email']
});
export type LoginRegular = z.infer<typeof LoginRegular>;

export const Refresh = z.object({});
export type Refresh = z.infer<typeof Refresh>;

export const Logout = z.object({});
export type Logout = z.infer<typeof Logout>;

export const ConversationCreate = z.object({});
export type ConversationCreate = z.infer<typeof ConversationCreate>;

export const MessageCreate = z.object({
  content: z.string()
});
export type MessageCreate = z.infer<typeof MessageCreate>;

export const FeedbackCreate = z.object({
  value: z.enum(['helpful', 'unhelpful', 'unclear'])
});
export type FeedbackCreate = z.infer<typeof FeedbackCreate>;

export const schemas = {
  RegisterAnon,
  LoginUsername,
  RecoverBySecretWord,
  RegisterRegular,
  LoginRegular,
  Refresh,
  Logout,
  ConversationCreate,
  MessageCreate,
  FeedbackCreate
};
