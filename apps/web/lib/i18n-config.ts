export const locales = ['ru', 'uz'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'ru';

export async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case 'uz':
      return (await import('../locales/uz.json')).default;
    case 'ru':
    default:
      return (await import('../locales/ru.json')).default;
  }
}
