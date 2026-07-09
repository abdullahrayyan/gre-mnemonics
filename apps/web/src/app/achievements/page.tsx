'use client';

import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import type { AchievementDto } from '@mnemonic/types';
import { Badge, Button, Card, CardTitle, Skeleton, cn } from '@mnemonic/ui';
import { useAchievements, useLeaderboard } from '@/hooks/use-gamification';

function AchievementCard({ achievement }: { achievement: AchievementDto }) {
  const earned = achievement.status === 'EARNED';
  const pct =
    achievement.target > 0 ? Math.round((achievement.progress / achievement.target) * 100) : 0;
  return (
    <Card className={cn('space-y-2', !earned && 'opacity-70')}>
      <div className="flex items-center justify-between">
        <CardTitle>{achievement.name}</CardTitle>
        <Badge tone={earned ? 'success' : 'default'}>{earned ? 'Earned' : achievement.tier}</Badge>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{achievement.description}</p>
      {!earned ? (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400">
            {achievement.progress} / {achievement.target}
          </p>
        </>
      ) : null}
    </Card>
  );
}

function Achievements() {
  const achievements = useAchievements();
  const leaderboard = useLeaderboard();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        {achievements.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.data?.data.map((achievement) => (
              <AchievementCard key={achievement.key} achievement={achievement} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        <Card className="divide-y divide-slate-200/60 p-0 dark:divide-white/10">
          {leaderboard.data?.data.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                'flex items-center justify-between px-4 py-3',
                entry.isCurrentUser && 'bg-indigo-50 dark:bg-indigo-500/10',
              )}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 text-slate-400">#{entry.rank}</span>
                <span className="font-medium">{entry.name}</span>
                <Badge tone="info">Lv {entry.level}</Badge>
              </span>
              <span className="font-semibold text-gradient">{entry.totalXp} XP</span>
            </div>
          ))}
          {leaderboard.data && leaderboard.data.data.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400">No learners yet — be the first!</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to earn badges and climb the leaderboard.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Achievements />
      </SignedIn>
    </div>
  );
}
