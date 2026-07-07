'use client';

import { Skeleton } from '@mnemonic/ui';
import { WordCard } from '@/components/word-card';
import { useWords } from '@/hooks/use-words';

export default function WordsPage() {
  const { data, isLoading, isError } = useWords({ pageSize: 24, status: 'PUBLISHED' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Words</h1>
        <p className="text-slate-500 dark:text-slate-400">Browse the vocabulary library.</p>
      </div>

      {isError ? (
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn’t load words. Make sure the API is running and seeded.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-2xl" />
            ))
          : data?.data.map((word) => <WordCard key={word.id} word={word} />)}
      </div>

      {data && data.data.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          No words yet — seed the database with <code>pnpm db:seed:gre</code>.
        </p>
      ) : null}
    </div>
  );
}
