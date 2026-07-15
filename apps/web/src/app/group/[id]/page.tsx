import { notFound } from 'next/navigation';
import { GroupReader } from '@/components/group-reader';
import { GROUP_COUNT, groupWords } from '@/lib/words';

export function generateStaticParams() {
  return Array.from({ length: GROUP_COUNT }, (_, index) => ({ id: String(index + 1) }));
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = Number(id);
  if (!Number.isInteger(group) || group < 1 || group > GROUP_COUNT) notFound();

  return <GroupReader group={group} words={groupWords(group)} />;
}
