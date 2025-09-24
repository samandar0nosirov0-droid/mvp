'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next-intl/client';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@aidvokat/ui';
import { locales } from '../lib/i18n-config';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 год
const COOKIE_NAME = 'NEXT_LOCALE';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common.languageSwitcher');
  const [pending, startTransition] = useTransition();

  const handleChange = () => {
    const nextLocale = locales.find((item) => item !== locale) ?? locale;

    document.cookie = `${COOKIE_NAME}=${nextLocale}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleChange}
      disabled={pending}
      aria-label={t('label')}
      title={t('label')}
    >
      {locale === 'ru' ? t('uz') : t('ru')}
    </Button>
  );
}
