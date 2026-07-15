'use client';

import { Card, cn } from '@mnemonic/ui';
import { Check } from 'lucide-react';
import Link from 'next/link';
import type { GroupSummary } from '@/lib/words';
import { useDoneGroups } from '@/lib/progress';

export function GroupIndex({ groups, total }: { groups: GroupSummary[]; total: number }) {
  const { done, loaded, isDone } = useDoneGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GRE Words</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {total} words in {groups.length} groups of 25. Read a group, mark it done, then revise.
        </p>
      </div>

      {loaded && done.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(done.length / groups.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {done.length} / {groups.length} done
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const complete = loaded && isDone(group.group);
          return (
            <Link key={group.group} href={`/group/${group.group}`}>
              <Card
                className={cn(
                  'flex h-full items-center justify-between gap-3 transition hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-500/40',
                  complete && 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5',
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold">Group {group.group}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {group.from} – {group.to}
                  </p>
                </div>
                {complete ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="shrink-0 text-sm text-slate-400">{group.count}</span>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
