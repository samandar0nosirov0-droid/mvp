import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('common');
  return <h1 className="text-xl">{t('title')}</h1>;
}
