'use client';

import { SignedIn, SignedOut, SignInButton, useUser } from '@/lib/auth';
import type { DashboardDto } from '@mnemonic/types';
import { Button, Card, CardTitle, Skeleton } from '@mnemonic/ui';
import Link from 'next/link';
import { GoalRing } from '@/components/goal-ring';
import { WeeklyChart } from '@/components/weekly-chart';
import { useDashboard, useUpdateGoal } from '@/hooks/use-dashboard';

const GOAL_OPTIONS = [10, 20, 30, 50];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gradient">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </Card>
  );
}

function GoalSelector({ current }: { current: number }) {
  const updateGoal = useUpdateGoal();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {GOAL_OPTIONS.map((goal) => (
        <Button
          key={goal}
          size="sm"
          variant={goal === current ? 'primary' : 'outline'}
          disabled={updateGoal.isPending}
          onClick={() => updateGoal.mutate(goal)}
        >
          {goal}
        </Button>
      ))}
    </div>
  );
}

function DashboardView({ data }: { data: DashboardDto }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4">
          <GoalRing completed={data.completedToday} goal={data.dailyGoal} />
          <div>
            <CardTitle>Today’s goal</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {data.remainingToday} words to go
            </p>
            <div className="mt-3">
              <GoalSelector current={data.dailyGoal} />
            </div>
          </div>
        </Card>
        <StatCard label="Reviews due" value={data.reviewsDue} hint="Ready to review now" />
        <StatCard
          label="Current streak"
          value={`${data.currentStreak} 🔥`}
          hint={`Longest ${data.longestStreak}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Level" value={data.level} hint={`${data.totalXp} XP`} />
        <StatCard
          label="Words learned"
          value={data.wordsLearned}
          hint={`${data.wordsMastered} mastered`}
        />
        <StatCard label="Retention" value={`${data.retentionPercent}%`} hint="Last 30 days" />
        <StatCard label="Monthly reviews" value={data.monthlyReviews} />
      </div>

      <Card>
        <CardTitle>This week</CardTitle>
        <div className="mt-4">
          <WeeklyChart data={data.weeklyActivity} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/review">
          <Button>Start review</Button>
        </Link>
        <Link href="/words">
          <Button variant="outline">Browse words</Button>
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
        Couldn’t load your dashboard. Make sure the API is running.
      </p>
    );
  }
  return <DashboardView data={data.data} />;
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {isLoaded && isSignedIn
            ? `Welcome back, ${user?.firstName ?? 'learner'}!`
            : 'Sign in to track your daily goal, streak, and reviews.'}
        </p>
      </div>

      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to see your goals, streak, and stats.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </div>
  );
}
