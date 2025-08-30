import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('common');
  return <main className="p-4">{t('title')}</main>;
}
