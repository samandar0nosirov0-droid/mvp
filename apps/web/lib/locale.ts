import { cookies, headers } from 'next/headers';
import { AppLocale, defaultLocale, locales } from './i18n-config';

export function detectLocale(): AppLocale {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as AppLocale)) {
    return cookieLocale as AppLocale;
  }

  const acceptLanguage = headers().get('accept-language');
  if (acceptLanguage) {
    const matched = acceptLanguage
      .split(',')
      .map((entry) => entry.split(';')[0]?.trim()?.toLowerCase())
      .find((entry) => locales.includes(entry as AppLocale));
    if (matched) {
      return matched as AppLocale;
    }
  }

  return defaultLocale;
}
