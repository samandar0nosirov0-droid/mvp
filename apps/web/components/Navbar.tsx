'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLang = (l: string) => {
    document.cookie = `NEXT_LOCALE=${l}; path=/`;
    router.replace(pathname);
  };

  return (
    <nav className="p-4 bg-gray-800 flex gap-2">
      <span className="mr-4">{t('lang')}:</span>
      {['uz', 'ru', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          className={l === locale ? 'font-bold' : ''}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
