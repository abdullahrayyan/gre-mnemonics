'use client';

import { Button, Card } from '@mnemonic/ui';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { Word } from '@/lib/words';

export function GroupRevision({ group, words }: { group: number; words: Word[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const word = words[index];

  const next = () => {
    if (index + 1 >= words.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
  };

  const restart = () => {
    setIndex(0);
    setRevealed(false);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Group {group} revised 🎉</h1>
        <p className="text-slate-500 dark:text-slate-400">
          You went through all {words.length} words.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={restart} variant="outline">
            <RotateCcw className="h-4 w-4" /> Revise again
          </Button>
          <Link href="/">
            <Button>All groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!word) return null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/group/${group}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Group {group}
        </Link>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {index + 1} / {words.length}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
        />
      </div>

      <Card
        onClick={() => setRevealed(true)}
        className="flex min-h-[22rem] cursor-pointer flex-col items-center justify-center gap-4 text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</h2>

        {revealed ? (
          <div className="space-y-3">
            <p className="text-lg text-slate-700 dark:text-slate-200">
              {word.meaning}
              {word.hindi ? (
                <span className="font-medium text-slate-500 dark:text-slate-400"> ({word.hindi})</span>
              ) : null}
            </p>
            {word.mnemonic ? (
              <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
                💡 {word.mnemonic}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Tap to reveal</p>
        )}
      </Card>

      <div className="flex justify-center">
        {revealed ? (
          <Button size="lg" onClick={next}>
            {index + 1 >= words.length ? 'Finish' : 'Next'}
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        )}
      </div>
    </div>
  );
}
