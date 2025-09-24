'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@aidvokat/ui';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('common.themeToggle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (!mounted) {
      return;
    }

    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-hidden disabled>
        🌓
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={handleToggle}
      aria-label={isDark ? t('light') : t('dark')}
      title={t('toggle')}
    >
      <span aria-hidden>{isDark ? '🌙' : '☀️'}</span>
    </Button>
  );
}
