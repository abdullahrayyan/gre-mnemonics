import { notFound } from 'next/navigation';
import { GroupRevision } from '@/components/group-revision';
import { GROUP_COUNT, groupWords } from '@/lib/words';

export function generateStaticParams() {
  return Array.from({ length: GROUP_COUNT }, (_, index) => ({ id: String(index + 1) }));
}

export default async function RevisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = Number(id);
  if (!Number.isInteger(group) || group < 1 || group > GROUP_COUNT) notFound();

  return <GroupRevision group={group} words={groupWords(group)} />;
}
