import { notFound } from 'next/navigation';
import { ShareContent } from './share-content';

interface SharePageProps {
  params: {
    slug?: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  const { slug } = params;
  if (!slug) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <ShareContent slug={slug} />
    </section>
  );
}
