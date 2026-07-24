import { GroupIndex } from '@/components/group-index';
import { LandingHero } from '@/components/landing-hero';
import { groupSummaries, WORDS } from '@/lib/words';

/** A recognisable word with a strong hook, shown as the landing-page sample. */
const SAMPLE_WORD = 'ephemeral';

export default function HomePage() {
  const groups = groupSummaries();
  const sample = WORDS.find((word) => word.word.toLowerCase() === SAMPLE_WORD) ?? WORDS[0];

  return (
    <div className="space-y-12">
      {sample ? (
        <LandingHero sample={sample} total={WORDS.length} groups={groups.length} />
      ) : null}
      <GroupIndex groups={groups} total={WORDS.length} />
    </div>
  );
}
