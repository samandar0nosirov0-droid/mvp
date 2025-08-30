import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {LanguageSwitcher} from '../../components/LanguageSwitcher';
import {ReactNode} from 'react';

export default async function RootLayout({children, params}: {children: ReactNode; params: {locale: string}}) {
  let messages;
  try {
    messages = (await import(`../../locales/${params.locale}.json`)).default;
  } catch (e) {
    notFound();
  }
  return (
    <html lang={params.locale} className="dark">
      <body className="p-4 text-white bg-gray-900 min-h-screen">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <nav className="mb-4 flex justify-end"><LanguageSwitcher /></nav>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
