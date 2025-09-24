import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@aidvokat/ui';
import { caseIdParamSchema } from '@aidvokat/contracts';
import { CaseChat } from '../../../components/case-chat';

interface CasePageProps {
  params: {
    id: string;
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const parsed = caseIdParamSchema.safeParse(params);
  if (!parsed.success) {
    notFound();
  }

  const t = await getTranslations('caseDetail');

  return (
    <section className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/dashboard">{t('back')}</Link>
      </Button>
      <CaseChat caseId={parsed.data.id} />
    </section>
  );
}
