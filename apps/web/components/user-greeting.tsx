'use client';

import { useTranslations } from 'next-intl';
import { useUserStore } from '../lib/store/user-store';

export function UserGreeting() {
  const user = useUserStore((state) => state.user);
  const t = useTranslations('dashboard');

  if (!user) {
    return null;
  }

  return <p className="text-sm text-muted-foreground">{t('welcome', { name: user.fullName })}</p>;
}
