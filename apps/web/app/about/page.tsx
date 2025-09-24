import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader } from '@aidvokat/ui';

const pillarKeys = ['accessible', 'secure', 'support'] as const;

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t('missionTitle')}</h2>
          <p className="text-lg text-muted-foreground">{t('missionBody')}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('visionTitle')}</h2>
        <p className="text-muted-foreground">{t('visionBody')}</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t('pillarsTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pillarKeys.map((key) => (
            <Card key={key}>
              <CardHeader>
                <h3 className="text-lg font-medium">{t(`pillars.${key}.title`)}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(`pillars.${key}.body`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold tracking-tight">{t('ctaTitle')}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('ctaBody')}</p>
        </CardContent>
      </Card>
    </section>
  );
}
