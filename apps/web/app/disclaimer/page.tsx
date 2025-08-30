import { getTranslations } from 'next-intl/server';

export default async function Disclaimer() {
  const t = await getTranslations('disclaimer');
  return <main className="p-4">{t('text')}</main>;
}
