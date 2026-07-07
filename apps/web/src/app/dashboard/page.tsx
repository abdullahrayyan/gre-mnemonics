'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardTitle } from '@mnemonic/ui';

const STATS = [
  { label: 'Words learned', value: '—' },
  { label: 'Current streak', value: '—' },
  { label: 'XP', value: '—' },
];

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {isLoaded && isSignedIn
            ? `Welcome back, ${user.firstName ?? 'learner'}!`
            : 'Sign in to track your daily goal, streak, and reviews.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardTitle>{stat.label}</CardTitle>
            <p className="mt-2 text-3xl font-bold text-gradient">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Coming soon</CardTitle>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Flashcards, daily goals, quizzes, and the AI tutor arrive in the next phases.
        </p>
      </Card>
    </div>
  );
}
