import { getTranslations } from 'next-intl/server';

export default async function About() {
  const t = await getTranslations('about');
  return <main className="p-4">{t('text')}</main>;
}
