'use client';

import type { WordDto } from '@mnemonic/types';
import { Badge, Button, Card, CardTitle, Skeleton, cn } from '@mnemonic/ui';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import {
  useAdminOverview,
  useGenerateWord,
  useModerate,
  useModerationMnemonics,
  useReports,
  useResolveReport,
} from '@/hooks/use-admin';

type Tab = 'overview' | 'moderation' | 'add';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  FLAGGED: 'warning',
  REJECTED: 'danger',
  OPEN: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'default',
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gradient">{value}</p>
    </Card>
  );
}

function Overview() {
  const overview = useAdminOverview();
  if (overview.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }
  const data = overview.data?.data;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Words" value={data?.words ?? 0} />
      <Stat label="Community mnemonics" value={data?.mnemonics ?? 0} />
      <Stat label="Open reports" value={data?.openReports ?? 0} />
      <Stat label="Users" value={data?.users ?? 0} />
    </div>
  );
}

function Moderation() {
  const mnemonics = useModerationMnemonics();
  const reports = useReports();
  const moderate = useModerate();
  const resolve = useResolveReport();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reports</h2>
        {reports.data?.data.length === 0 ? (
          <p className="text-sm text-slate-400">No reports. 🎉</p>
        ) : (
          reports.data?.data.map((report) => (
            <Card key={report.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm">
                  <Badge tone={STATUS_TONE[report.status] ?? 'default'}>{report.status}</Badge>{' '}
                  <span className="font-medium">{report.reason}</span> on {report.targetType}
                </p>
                {report.details ? (
                  <p className="mt-1 text-xs text-slate-500">{report.details}</p>
                ) : null}
              </div>
              {report.status === 'OPEN' ? (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolve.mutate({ id: report.id, status: 'RESOLVED' })}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolve.mutate({ id: report.id, status: 'DISMISSED' })}
                  >
                    Dismiss
                  </Button>
                </div>
              ) : null}
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Community mnemonics</h2>
        {mnemonics.isLoading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : (
          mnemonics.data?.data.map((mnemonic) => (
            <Card key={mnemonic.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge tone="info">{mnemonic.word}</Badge>
                <Badge tone={STATUS_TONE[mnemonic.status] ?? 'default'}>{mnemonic.status}</Badge>
                <span className="text-xs text-slate-400">by {mnemonic.authorName}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">{mnemonic.content}</p>
              <div className="flex gap-2">
                {(['APPROVED', 'FLAGGED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={mnemonic.status === status ? 'primary' : 'outline'}
                    disabled={moderate.isPending}
                    onClick={() => moderate.mutate({ id: mnemonic.id, status })}
                  >
                    {status.toLowerCase()}
                  </Button>
                ))}
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function AddWord() {
  const generate = useGenerateWord();
  const [word, setWord] = useState('');
  const [created, setCreated] = useState<WordDto | null>(null);

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Generate a new word with AI</CardTitle>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter any English word — the AI engine writes the meaning, mnemonics, and more, then
          publishes it.
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!word.trim()) return;
          generate.mutate(word.trim(), { onSuccess: (result) => setCreated(result.data) });
        }}
        className="flex gap-2"
      >
        <input
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="e.g. perspicacious"
          className="flex-1 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <Button type="submit" disabled={generate.isPending || !word.trim()}>
          {generate.isPending ? 'Generating…' : 'Generate'}
        </Button>
      </form>
      {generate.isError ? (
        <p className="text-sm text-rose-500">Generation failed. Is OPENAI_API_KEY set on the API?</p>
      ) : null}
      {created ? (
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          <p className="font-semibold">
            {created.word} <span className="text-sm font-normal text-slate-400">added ✓</span>
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{created.meaning}</p>
          {created.ai.hinglishMnemonic ? (
            <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-300">
              💡 {created.ai.hinglishMnemonic}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const overview = useAdminOverview();

  if (overview.isError) {
    return (
      <Card className="text-center">
        <p className="text-slate-500 dark:text-slate-400">
          You need an admin account to view this page.
        </p>
      </Card>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'moderation', label: 'Moderation' },
    { key: 'add', label: 'Add word' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              tab === item.key
                ? 'bg-indigo-500 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? <Overview /> : null}
      {tab === 'moderation' ? <Moderation /> : null}
      {tab === 'add' ? <AddWord /> : null}
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in with an admin account.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <AdminPanel />
      </SignedIn>
    </div>
  );
}
