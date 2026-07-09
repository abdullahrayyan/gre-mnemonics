'use client';

import { Skeleton, cn } from '@mnemonic/ui';
import { useEffect, useRef, useState } from 'react';
import { WordCard } from '@/components/word-card';
import { WordCarousel } from '@/components/word-carousel';
import { useAllWords } from '@/hooks/use-words';

export default function WordsPage() {
  const { data: words, isLoading, isError } = useAllWords({ status: 'PUBLISHED', sort: 'word', order: 'asc' });
  const [index, setIndex] = useState(0);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the highlighted card in view as the carousel advances.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [index]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Words</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {words ? `Browse all ${words.length} GRE words — use ← → to flip through them.` : 'Browse the vocabulary library.'}
          </p>
        </div>
      </div>

      {isError ? (
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn’t load words. Make sure the API is running and seeded.
        </p>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : words && words.length > 0 ? (
        <WordCarousel words={words} index={index} onIndexChange={setIndex} />
      ) : null}

      {words && words.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            All words
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((word, i) => (
              <button
                key={word.id}
                ref={i === index ? activeRef : null}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'rounded-2xl text-left outline-none transition',
                  i === index
                    ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent'
                    : 'hover:opacity-90',
                )}
              >
                <WordCard word={word} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {words && words.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          No words yet — generate the corpus with{' '}
          <code>node apps/api/scripts/generate-demo-corpus.ts</code>.
        </p>
      ) : null}
    </div>
  );
}
