'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader } from '@aidvokat/ui';
import { fetchSharedCase } from '../../../lib/api/share';
import type { AppLocale } from '../../../lib/i18n-config';

interface ShareContentProps {
  slug: string;
}

function formatDate(date: string, locale: AppLocale) {
  const formatter = new Intl.DateTimeFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Tashkent'
  });

  return formatter.format(new Date(date));
}

export function ShareContent({ slug }: ShareContentProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('share');
  const query = useQuery({
    queryKey: ['shared-case', slug, locale],
    queryFn: () => fetchSharedCase(slug, locale),
    staleTime: 60_000
  });

  if (query.isPending) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-destructive">{t('notFound')}</p>
        </CardContent>
      </Card>
    );
  }

  const { data } = query;
  const formattedDate = formatDate(data.updatedAt, locale);
  const sourceLanguageLabel = t(`language.${data.sourceLanguage}`);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{t('metadata.language', { language: sourceLanguageLabel })}</span>
            <span>{t('metadata.updatedAt', { date: formattedDate })}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">{data.summary}</p>
          <Button asChild>
            <Link href="/cases/new">{t('cta')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
