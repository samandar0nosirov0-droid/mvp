import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader } from '@aidvokat/ui';
import { AppLocale } from '../../lib/i18n-config';
import { formatCurrency, formatDate } from '../../lib/format';
import { UserGreeting } from '../../components/user-greeting';

const planRequestsLeft = 3;
const planRenewalPrice = 150000;

export default async function DashboardPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('dashboard');

  const cases = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: t('sampleCase.title'),
      updatedAt: new Date('2024-01-15T10:00:00+05:00')
    }
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
          <UserGreeting />
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
                {t('lastUpdated', { date: formatDate(legalCase.updatedAt, locale) })}
              </p>
              <Button variant="secondary" asChild>
                <Link href={`/cases/${legalCase.id}`}>{t('openCase')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">{t('plan.title')}</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('plan.current', { name: t('plan.free') })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('plan.requestsLeft', { count: planRequestsLeft })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('plan.renewal', { amount: formatCurrency(planRenewalPrice, locale) })}
            </p>
            <Button variant="outline" asChild>
              <Link href="/#tariffs">{t('plan.upgradeCta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
