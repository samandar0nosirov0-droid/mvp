import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const disclaimerKeys = ['disclaimerItem1', 'disclaimerItem2', 'disclaimerItem3'] as const;
const linkKeys = ['linkAbout', 'linkFaq', 'linkPrivacy', 'linkTerms'] as const;
const linkHrefMap: Record<(typeof linkKeys)[number], string> = {
  linkAbout: '/about',
  linkFaq: '/faq',
  linkPrivacy: '/docs/privacy',
  linkTerms: '/docs/terms'
};

export async function Footer() {
  const t = await getTranslations('common.footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t('disclaimerTitle')}</h2>
          <p>{t('disclaimerIntro')}</p>
          <ul className="list-disc space-y-1 pl-5">
            {disclaimerKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t('linksTitle')}</h2>
          <nav className="flex flex-col gap-1">
            {linkKeys.map((key) => (
              <Link key={key} href={linkHrefMap[key]} className="hover:text-foreground">
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t('contactTitle')}</h2>
          <a href={`mailto:${t('contactEmail')}`} className="text-foreground hover:underline">
            {t('contactEmail')}
          </a>
          <p>{t('contactHours')}</p>
        </div>
      </div>
      <p className="mt-6 text-xs">{t('copyright', { year })}</p>
    </footer>
  );
}
