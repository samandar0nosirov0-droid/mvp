import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatDate', () => {
  it('formats dates in DD.MM.YYYY for ru locale', () => {
    const result = formatDate('2024-03-05T10:00:00Z', 'ru');
    expect(result).toBe('05.03.2024');
  });

  it('formats dates in DD.MM.YYYY for uz locale', () => {
    const result = formatDate(new Date('2024-07-15T06:30:00Z'), 'uz');
    expect(result).toBe('15.07.2024');
  });
});

describe('formatCurrency', () => {
  it('uses UZS code and spacing for ru locale', () => {
    const result = formatCurrency(1234567, 'ru');
    expect(result).toBe('1\u00A0234\u00A0567\u00A0UZS');
  });

  it('uses UZS code and spacing for uz locale', () => {
    const result = formatCurrency(7654321, 'uz');
    expect(result).toBe('7\u00A0654\u00A0321\u00A0UZS');
  });
});
