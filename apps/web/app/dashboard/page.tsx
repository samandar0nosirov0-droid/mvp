import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader } from '@aidvokat/ui';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  const cases = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: t('sampleCase.title'),
      updatedAt: '01.01.2024'
    }
  ];

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/cases/new">{t('createCase')}</Link>
        </Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {cases.map((legalCase) => (
          <Card key={legalCase.id}>
            <CardHeader>
              <h2 className="text-lg font-medium">{legalCase.title}</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('lastUpdated', { date: legalCase.updatedAt })}
              </p>
              <Button variant="secondary" asChild>
                <Link href={`/cases/${legalCase.id}`}>{t('openCase')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
