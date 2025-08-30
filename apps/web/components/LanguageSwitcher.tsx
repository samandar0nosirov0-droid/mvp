'use client';
import Link from 'next-intl/link';
import {useLocale} from 'next-intl';
import {usePathname} from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <div className="space-x-2">
      {['en', 'ru', 'uz'].map(l => (
        <Link key={l} href={pathname} locale={l} className={l === locale ? 'font-bold' : ''}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
