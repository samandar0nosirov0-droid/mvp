import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader } from '@aidvokat/ui';
import { caseIdParamSchema } from '@aidvokat/contracts';

interface CasePageProps {
  params: {
    id: string;
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const parsed = caseIdParamSchema.safeParse(params);
  if (!parsed.success) {
    notFound();
  }

  const t = await getTranslations('caseDetail');
  const currentCase = {
    id: parsed.data.id,
    title: t('sample.title'),
    description: t('sample.description'),
    updatedAt: '01.01.2024'
  };

  return (
    <section className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/dashboard">{t('back')}</Link>
      </Button>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">{currentCase.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t('lastUpdated', { date: currentCase.updatedAt })}
          </p>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-base leading-relaxed">{currentCase.description}</p>
        </CardContent>
      </Card>
      {/* TODO: История сообщений и форма ответа */}
    </section>
  );
}
