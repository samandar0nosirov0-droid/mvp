import { AppLocale } from '../i18n-config';

export interface SharedCaseViewModel {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  sourceLanguage: AppLocale;
}

interface SharedCaseEntry {
  slug: string;
  language: AppLocale;
  titles: Record<AppLocale, string>;
  summaries: Record<AppLocale, string>;
  updatedAt: string;
}

const MOCK_SHARED_CASES: SharedCaseEntry[] = [
  {
    slug: 'family-law-basic',
    language: 'ru',
    titles: {
      ru: 'Пример консультации по семейному праву',
      uz: 'Oila huquqi bo‘yicha maslahat namunasi'
    },
    summaries: {
      ru: 'Клиент спрашивает о порядке расторжения брака и раздела имущества. Мы объяснили шаги, какие документы понадобятся и как подготовиться к суду.',
      uz: 'Mijoz nikohni bekor qilish va mulkni taqsimlash tartibi haqida so‘radi. Biz zarur hujjatlar va sud jarayoni bosqichlarini tushuntirdik.'
    },
    updatedAt: '2024-01-05T09:00:00+05:00'
  },
  {
    slug: 'employment-contract',
    language: 'uz',
    titles: {
      ru: 'Трудовой договор: на что обратить внимание',
      uz: 'Mehnat shartnomasida nimalarga e’tibor berish kerak'
    },
    summaries: {
      ru: 'Разбираем, какие пункты трудового договора стоит уточнить перед подписанием, чтобы защитить свои права.',
      uz: 'Imzo chekishdan oldin huquqlaringizni himoya qilish uchun mehnat shartnomasidagi asosiy bandlarni ko‘rib chiqamiz.'
    },
    updatedAt: '2024-01-12T14:30:00+05:00'
  }
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSharedCase(slug: string, locale: AppLocale): Promise<SharedCaseViewModel> {
  await delay(300);
  const entry = MOCK_SHARED_CASES.find((item) => item.slug === slug);

  if (!entry) {
    throw new Error('NOT_FOUND');
  }

  return {
    slug: entry.slug,
    sourceLanguage: entry.language,
    title: entry.titles[locale] ?? entry.titles[entry.language],
    summary: entry.summaries[locale] ?? entry.summaries[entry.language],
    updatedAt: entry.updatedAt
  };
}
