import './globals.css';

import type { Metadata } from 'next';
import Link from 'next/link';
import { createTranslator } from 'next-intl';
import { Providers } from './providers';
import { detectLocale } from '../lib/locale';
import { AppLocale, defaultLocale, loadMessages } from '../lib/i18n-config';
import { LanguageSwitcher } from '../components/language-switcher';
import { ThemeToggle } from '../components/theme-toggle';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: 'Айдвокат — цифровой помощник',
  description: 'ИИ-ассистент для правовых вопросов населения Узбекистана'
};

async function getMessages(locale: AppLocale) {
  try {
    return await loadMessages(locale);
  } catch (error) {
    console.error('Не удалось загрузить переводы', error);
    return await loadMessages(defaultLocale);
  }
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = detectLocale();
  const messages = await getMessages(locale);
  const t = createTranslator({ locale, messages });

  const navigation = [
    { href: '/dashboard', label: t('common.navigation.dashboard') },
    { href: '/about', label: t('common.navigation.about') }
  ];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers locale={locale} messages={messages}>
          <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8">
            <header className="flex flex-col gap-6 pb-6">
              <div className="space-y-1">
                <Link href="/" className="text-lg font-semibold tracking-tight sm:text-xl">
                  {t('common.brand.name')}
                </Link>
                <p className="text-sm text-muted-foreground">{t('common.brand.tagline')}</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </header>
            <main className="flex-1 pb-10">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
