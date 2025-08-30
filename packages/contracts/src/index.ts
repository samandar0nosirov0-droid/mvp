import {z} from 'zod';

export const Roles = z.enum(['user','admin_registered','admin_full']);
export const AccountKind = z.enum(['anon','regular']);
export const Locales = z.enum(['en','ru','uz']);

export const RegisterAnon = z.object({
  username: z.string(),
  password: z.string(),
  secret_word: z.string()
});

export const LoginUsername = z.object({
  username: z.string(),
  password: z.string()
});

export const RecoverBySecretWord = z.object({
  username: z.string(),
  secret_word: z.string(),
  new_password: z.string()
});

export const RegisterRegular = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string(),
    username: z.string().optional()
  })
  .refine(d => d.email || d.phone, {message: 'email or phone required'});

export const LoginRegular = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string()
  })
  .refine(d => d.email || d.phone, {message: 'email or phone required'});

export const Refresh = z.object({});
export const Logout = z.object({});

export const ConversationCreate = z.object({});
export const MessageCreate = z.object({content: z.string()});
export const FeedbackCreate = z.object({
  value: z.enum(['helpful','unhelpful','unclear'])
});

export type RegisterAnonDTO = z.infer<typeof RegisterAnon>;
export type LoginUsernameDTO = z.infer<typeof LoginUsername>;
export type RecoverBySecretWordDTO = z.infer<typeof RecoverBySecretWord>;
export type RegisterRegularDTO = z.infer<typeof RegisterRegular>;
export type LoginRegularDTO = z.infer<typeof LoginRegular>;
export type ConversationCreateDTO = z.infer<typeof ConversationCreate>;
export type MessageCreateDTO = z.infer<typeof MessageCreate>;
export type FeedbackCreateDTO = z.infer<typeof FeedbackCreate>;
