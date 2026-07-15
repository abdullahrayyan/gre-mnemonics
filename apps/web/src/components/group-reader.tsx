'use client';

import { Badge, Button, Card } from '@mnemonic/ui';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Word } from '@/lib/words';
import { useDoneGroups } from '@/lib/progress';

function WordEntry({ word }: { word: Word }) {
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold">{word.word}</h2>
        {word.pos ? (
          <span className="text-xs uppercase tracking-wide text-slate-400">{word.pos}</span>
        ) : null}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {word.meaning}
        {word.hindi ? (
          <span className="font-medium text-slate-500 dark:text-slate-400"> ({word.hindi})</span>
        ) : null}
      </p>
      {word.mnemonic ? (
        <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
          💡 {word.mnemonic}
        </p>
      ) : null}
      {word.hinglish ? (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
          {word.hinglish}
        </p>
      ) : null}
    </Card>
  );
}

export function GroupReader({ group, words }: { group: number; words: Word[] }) {
  const router = useRouter();
  const { loaded, isDone, markDone } = useDoneGroups();
  const complete = loaded && isDone(group);

  const finish = () => {
    markDone(group);
    router.push(`/group/${group}/revise`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> All groups
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Group {group}</h1>
          {complete ? <Badge tone="success">Done</Badge> : null}
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {words.length} words · {words[0]?.word} – {words[words.length - 1]?.word}
        </p>
      </div>

      <div className="space-y-3">
        {words.map((word) => (
          <WordEntry key={word.word} word={word} />
        ))}
      </div>

      <div className="sticky bottom-4 flex justify-center">
        <Button size="lg" onClick={finish} className="shadow-lg">
          <Check className="h-5 w-5" />
          {complete ? 'Revise again' : 'Done — revise these words'}
        </Button>
      </div>
    </div>
  );
}
