import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { caseCreateSchema, messageCreateSchema, signInSchema } from '../src';

describe('contracts', () => {
  it('validates sign-in payload', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'supersecret',
      locale: 'uz'
    });

    expect(result.success).toBe(true);
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
});
