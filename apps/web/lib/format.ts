import { AppLocale, defaultLocale, locales } from './i18n-config';

const dateFormatters = new Map<AppLocale, Intl.DateTimeFormat>();
const currencyFormatters = new Map<AppLocale, Intl.NumberFormat>();

function normalizeLocale(input?: string): AppLocale {
  if (input && locales.includes(input as AppLocale)) {
    return input as AppLocale;
  }
  return defaultLocale;
}

function resolveDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value');
  }
  return date;
}

export function formatDate(value: Date | string | number, locale?: string): string {
  const normalized = normalizeLocale(locale);
  let formatter = dateFormatters.get(normalized);

  if (!formatter) {
    const bcp47 = normalized === 'uz' ? 'uz-UZ' : 'ru-RU';
    formatter = new Intl.DateTimeFormat(bcp47, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Tashkent'
    });
    dateFormatters.set(normalized, formatter);
  }

  const parts = formatter.formatToParts(resolveDate(value));
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const year = parts.find((part) => part.type === 'year')?.value ?? '';

  return [day.padStart(2, '0'), month.padStart(2, '0'), year].join('.');
}

export function formatCurrency(value: number, locale?: string): string {
  const normalized = normalizeLocale(locale);
  let formatter = currencyFormatters.get(normalized);

  if (!formatter) {
    const bcp47 = normalized === 'uz' ? 'uz-UZ' : 'ru-RU';
    formatter = new Intl.NumberFormat(bcp47, {
      style: 'currency',
      currency: 'UZS',
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      useGrouping: true
    });
    currencyFormatters.set(normalized, formatter);
  }

  return formatter.format(value);
}
