'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next-intl/client';
import { useLocale } from 'next-intl';
import { Button } from '@aidvokat/ui';
import { locales } from '../lib/i18n-config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const handleChange = () => {
    const nextLocale = locales.find((item) => item !== locale) ?? locale;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Button variant="ghost" onClick={handleChange} disabled={pending}>
      {locale === 'ru' ? "O'zbekcha" : 'Русский'}
    </Button>
  );
}
