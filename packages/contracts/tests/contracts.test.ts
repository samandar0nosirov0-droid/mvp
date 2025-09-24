import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  caseCreateSchema,
  feedbackCreateSchema,
  llmPromptSchema,
  messageCreateSchema,
  signInSchema,
  signUpSchema
} from '../src';

describe('contracts', () => {
  it('validates sign-in payload', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'supersecret',
      locale: 'uz'
    });

    expect(result.success).toBe(true);
  });

  it('validates sign-up payload with matching passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'supersecret',
      confirmPassword: 'supersecret',
      fullName: 'Ali Valiyev',
      locale: 'ru'
    });

    expect(result.success).toBe(true);
  });

  it('rejects sign-up when passwords differ', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'supersecret',
      confirmPassword: 'another',
      fullName: 'Ali Valiyev',
      locale: 'ru'
    });

    expect(result.success).toBe(false);
  });

  it('removes empty metadata entries for cases', () => {
    const result = caseCreateSchema.parse({
      title: 'Нужна консультация',
      description: 'Описание запроса для юриста.',
      category: 'civil',
      language: 'ru',
      metadata: {
        phone: '',
        city: 'Ташкент'
      }
    });

    expect(result.metadata).toStrictEqual({ city: 'Ташкент' });
  });

  it('enforces message length restrictions', () => {
    expect(() =>
      messageCreateSchema.parse({
        caseId: randomUUID(),
        content: '',
        role: 'user',
        locale: 'ru'
      })
    ).toThrow();
  });

  it('validates feedback payload shape', () => {
    const result = feedbackCreateSchema.safeParse({
      message: 'Отличный сервис, продолжайте!',
      rating: 5,
      locale: 'uz'
    });

    expect(result.success).toBe(true);
  });

  it('limits llm prompt length', () => {
    expect(() =>
      llmPromptSchema.parse({
        prompt: 'ask',
        locale: 'ru'
      })
    ).toThrow();
  });
});
