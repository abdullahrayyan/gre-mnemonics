'use client';

import type { WordDto } from '@mnemonic/types';
import { Skeleton, cn } from '@mnemonic/ui';
import { useMemo, useState } from 'react';
import { WordCard } from '@/components/word-card';
import { WordCarousel } from '@/components/word-carousel';
import { useAllWords } from '@/hooks/use-words';

const GROUP_SIZE = 25;
const ALL = -1;

function chunk(words: WordDto[]): WordDto[][] {
  const groups: WordDto[][] = [];
  for (let i = 0; i < words.length; i += GROUP_SIZE) {
    groups.push(words.slice(i, i + GROUP_SIZE));
  }
  return groups;
}

export default function WordsPage() {
  const { data: words, isLoading, isError } = useAllWords({
    status: 'PUBLISHED',
    sort: 'word',
    order: 'asc',
  });
  const [group, setGroup] = useState<number>(ALL);
  const [index, setIndex] = useState(0);

  const groups = useMemo(() => (words ? chunk(words) : []), [words]);
  const active = group === ALL ? (words ?? []) : (groups[group] ?? []);

  const selectGroup = (value: number) => {
    setGroup(value);
    setIndex(0);
  };

  const subtitle = !words
    ? 'Browse the vocabulary library.'
    : group === ALL
      ? `Browse all ${words.length} GRE words — or pick a group of ${GROUP_SIZE} to focus.`
      : `Group ${group + 1} — ${active.length} words. Use ← → to flow through them.`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Words</h1>
        <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      {isError ? (
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn’t load words. Make sure the API is running and seeded.
        </p>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : words && words.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Groups column */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Groups of {GROUP_SIZE}
            </h2>
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-slate-200/70 p-2 dark:border-white/10 lg:max-h-[70vh]">
              <button
                type="button"
                onClick={() => selectGroup(ALL)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                  group === ALL
                    ? 'bg-indigo-500 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-white/10',
                )}
              >
                <span className="font-medium">All words</span>
                <span className={cn('text-xs', group === ALL ? 'text-indigo-100' : 'text-slate-400')}>
                  {words.length}
                </span>
              </button>
              {groups.map((words25, i) => {
                const selected = group === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectGroup(i)}
                    className={cn(
                      'block w-full rounded-lg px-3 py-2 text-left transition',
                      selected ? 'bg-indigo-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10',
                    )}
                  >
                    <span className="text-sm font-medium">Group {i + 1}</span>
                    <span
                      className={cn(
                        'block truncate text-xs',
                        selected ? 'text-indigo-100' : 'text-slate-400',
                      )}
                    >
                      {words25[0]?.word} – {words25[words25.length - 1]?.word}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Carousel + scoped grid */}
          <div className="min-w-0 space-y-6">
            {active.length > 0 ? (
              <WordCarousel words={active} index={index} onIndexChange={setIndex} />
            ) : null}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {group === ALL ? 'All words' : `Group ${group + 1}`}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {active.map((word, i) => (
                  <button
                    key={word.id}
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
