'use client';

import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { AppLocale } from '../lib/i18n-config';

function useStableQueryClient() {
  const [client] = React.useState(() => new QueryClient());
  return client;
}

export interface ProvidersProps {
  children: React.ReactNode;
  locale: AppLocale;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const queryClient = useStableQueryClient();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Tashkent">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
}
