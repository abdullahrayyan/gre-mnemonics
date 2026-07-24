import { Card } from '@mnemonic/ui';
import { ArrowRight, Languages, Lightbulb, WifiOff } from 'lucide-react';
import Link from 'next/link';
import type { Word } from '@/lib/words';

const FEATURES = [
  {
    icon: Lightbulb,
    title: 'A memory hook for every word',
    body: 'Each word carries a vivid, sticky mnemonic — not just a definition to forget.',
  },
  {
    icon: Languages,
    title: 'Hindi & Hinglish meanings',
    body: 'Every entry pairs the English sense with a Hindi meaning so it clicks faster.',
  },
  {
    icon: WifiOff,
    title: 'Offline PWA, no sign-up',
    body: 'Install it, study anywhere. Your progress saves on-device — nothing to log into.',
  },
];

export function LandingHero({
  sample,
  total,
  groups,
}: {
  sample: Word;
  total: number;
  groups: number;
}) {
  return (
    <section className="space-y-10">
      {/* Headline */}
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/60 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur dark:border-indigo-500/30 dark:bg-white/5 dark:text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          {total.toLocaleString()} words · fully curated
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          GRE vocabulary that <span className="text-gradient">actually sticks</span>.
        </h1>

        <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
          {total.toLocaleString()} hand-curated words — each with a memory hook and a Hindi meaning.
          Learn in groups of 25, then revise. No sign-up, works offline.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/group/1"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-base font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
          >
            Start with Group 1 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#groups"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 text-base font-medium text-slate-800 transition hover:bg-slate-100 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10"
          >
            Browse all {groups} groups
          </Link>
        </div>
      </div>

      {/* Live sample of the actual product value */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          A word from the deck
        </p>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{sample.word}</h2>
            {sample.pos ? (
              <span className="text-xs uppercase tracking-wide text-slate-400">{sample.pos}</span>
            ) : null}
          </div>

          <p className="text-slate-700 dark:text-slate-200">
            {sample.meaning}
            {sample.hindi ? (
              <span className="font-medium text-slate-500 dark:text-slate-400"> ({sample.hindi})</span>
            ) : null}
          </p>

          {sample.mnemonic ? (
            <p className="rounded-xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
              💡 {sample.mnemonic}
            </p>
          ) : null}
        </Card>
      </div>

      {/* Feature strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <feature.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold">{feature.title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
