import type { ReactNode } from 'react';
import '../app/globals.css';
import { NextIntlClientProvider, getMessages, getLocale } from 'next-intl/server';
import Navbar from '../components/Navbar';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-gray-900 text-gray-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
