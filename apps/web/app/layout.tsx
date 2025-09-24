import './globals.css';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from './providers';
import { detectLocale } from '../lib/locale';
import { AppLocale, defaultLocale, loadMessages } from '../lib/i18n-config';
import { LanguageSwitcher } from '../components/language-switcher';
import { ThemeToggle } from '../components/theme-toggle';

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers locale={locale} messages={messages}>
          <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8">
            <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="text-lg font-semibold tracking-tight sm:text-xl">
                Айдвокат
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
