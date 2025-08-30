import {useTranslations} from 'next-intl';

export default function Disclaimer() {
  const t = useTranslations('disclaimer');
  return <p>{t('text')}</p>;
}
