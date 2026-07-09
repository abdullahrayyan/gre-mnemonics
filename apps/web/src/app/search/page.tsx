'use client';

import { Button, Skeleton, cn } from '@mnemonic/ui';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { WordCard } from '@/components/word-card';
import { useDebouncedValue, useSearch } from '@/hooks/use-search';

const DIFFICULTIES = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const;
const PARTS = ['NOUN', 'VERB', 'ADJECTIVE', 'ADVERB'] as const;

function initialQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') ?? '';
}

export default function SearchPage() {
  const [query, setQuery] = useState(initialQuery);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);

  const debounced = useDebouncedValue(query.trim(), 250);
  const enabled = debounced.length >= 1 || difficulty !== null || part !== null;

  const results = useSearch(
    {
      term: debounced || undefined,
      difficulty: difficulty ?? undefined,
      partOfSpeech: part ?? undefined,
      status: 'PUBLISHED',
      sort: 'word',
      order: 'asc',
      pageSize: 60,
    },
    enabled,
  );

  const total = results.data?.pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Search by word, meaning, Hindi, synonym, or root.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. talkative, कठोर, buttress, greg-…"
          autoFocus
          className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">Difficulty</span>
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty((current) => (current === level ? null : level))}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                difficulty === level
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
              )}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">Type</span>
          {PARTS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPart((current) => (current === pos ? null : pos))}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                part === pos
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
              )}
            >
              {pos.toLowerCase()}
            </button>
          ))}
        </div>
        {(difficulty || part) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDifficulty(null);
              setPart(null);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {!enabled ? (
        <p className="py-10 text-center text-slate-400">Start typing to search 1,112 GRE words.</p>
      ) : results.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="py-10 text-center text-slate-400">No matches. Try a different term or filter.</p>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} {total === 1 ? 'result' : 'results'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.data?.data.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
