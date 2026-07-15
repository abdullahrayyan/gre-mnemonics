import { GroupIndex } from '@/components/group-index';
import { groupSummaries, WORDS } from '@/lib/words';

export default function HomePage() {
  return <GroupIndex groups={groupSummaries()} total={WORDS.length} />;
}
