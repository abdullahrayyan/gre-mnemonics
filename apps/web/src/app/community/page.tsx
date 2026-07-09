'use client';

import type { CommunityMnemonicDto, CommunitySort, WordDto } from '@mnemonic/types';
import { Badge, Button, Card, Skeleton, cn } from '@mnemonic/ui';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CommentThread } from '@/components/comment-thread';
import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import {
  useAddComment,
  useComments,
  useCommunityFeed,
  useSubmitMnemonic,
  useVoteMnemonic,
} from '@/hooks/use-community';
import { useAllWords } from '@/hooks/use-words';

function VoteControl({ mnemonic }: { mnemonic: CommunityMnemonicDto }) {
  const vote = useVoteMnemonic();
  const cast = (value: number) =>
    vote.mutate({ id: mnemonic.id, value: mnemonic.viewerVote === value ? 0 : value });
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => cast(1)}
        disabled={vote.isPending}
        className={cn(
          'rounded p-1 hover:bg-slate-100 dark:hover:bg-white/10',
          mnemonic.viewerVote === 1 && 'text-indigo-500',
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold">{mnemonic.score}</span>
      <button
        type="button"
        onClick={() => cast(-1)}
        disabled={vote.isPending}
        className={cn(
          'rounded p-1 hover:bg-slate-100 dark:hover:bg-white/10',
          mnemonic.viewerVote === -1 && 'text-rose-500',
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

function Comments({ mnemonicId }: { mnemonicId: string }) {
  const { data, isLoading } = useComments(mnemonicId);
  const addComment = useAddComment(mnemonicId);
  const [text, setText] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    addComment.mutate({ content: text.trim() });
    setText('');
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-2 dark:border-white/5">
      {isLoading ? (
        <Skeleton className="h-10 w-full rounded-lg" />
      ) : (
        <CommentThread comments={data?.data ?? []} />
      )}
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-lg border border-slate-200 bg-white/60 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <Button type="submit" size="sm" disabled={addComment.isPending || !text.trim()}>
          Post
        </Button>
      </form>
    </div>
  );
}

function MnemonicCard({ mnemonic }: { mnemonic: CommunityMnemonicDto }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="flex gap-3">
      <VoteControl mnemonic={mnemonic} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone="info">{mnemonic.word}</Badge>
          <span className="text-xs text-slate-400">by {mnemonic.authorName}</span>
        </div>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{mnemonic.content}</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {mnemonic.commentCount} {mnemonic.commentCount === 1 ? 'comment' : 'comments'}
        </button>
        {open ? <Comments mnemonicId={mnemonic.id} /> : null}
      </div>
    </Card>
  );
}

function ShareForm({ words }: { words: WordDto[] }) {
  const submit = useSubmitMnemonic();
  const [wordText, setWordText] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wordByText = useMemo(
    () => new Map(words.map((w) => [w.word.toLowerCase(), w])),
    [words],
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const word = wordByText.get(wordText.trim().toLowerCase());
    if (!word) {
      setError('Pick a word from the list.');
      return;
    }
    if (content.trim().length < 3) {
      setError('Write a slightly longer mnemonic.');
      return;
    }
    setError(null);
    submit.mutate(
      { wordId: word.id, content: content.trim() },
      { onSuccess: () => setContent('') },
    );
  };

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Share your mnemonic</h2>
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          list="community-words"
          value={wordText}
          onChange={(event) => setWordText(event.target.value)}
          placeholder="Word (start typing…)"
          className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <datalist id="community-words">
          {words.slice(0, 1200).map((word) => (
            <option key={word.id} value={word.word} />
          ))}
        </datalist>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Your memory hook — a sound-alike, rhyme, or vivid image…"
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        {error ? <p className="text-xs text-rose-500">{error}</p> : null}
        <Button type="submit" size="sm" disabled={submit.isPending}>
          {submit.isPending ? 'Sharing…' : 'Share'}
        </Button>
      </form>
    </Card>
  );
}

function Feed() {
  const [sort, setSort] = useState<CommunitySort>('new');
  const feed = useCommunityFeed(sort);
  const words = useAllWords({ status: 'PUBLISHED', sort: 'word', order: 'asc' });

  return (
    <div className="space-y-6">
      <ShareForm words={words.data ?? []} />

      <div className="flex gap-2">
        {(['new', 'top'] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={sort === option ? 'primary' : 'outline'}
            onClick={() => setSort(option)}
          >
            {option === 'new' ? 'Newest' : 'Top rated'}
          </Button>
        ))}
      </div>

      {feed.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {feed.data?.data.map((mnemonic) => (
            <MnemonicCard key={mnemonic.id} mnemonic={mnemonic} />
          ))}
          {feed.data && feed.data.data.length === 0 ? (
            <p className="text-sm text-slate-400">No mnemonics yet — be the first to share one!</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Share and discover the best learner-made mnemonics.
        </p>
      </div>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to share mnemonics, vote, and comment.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Feed />
      </SignedIn>
    </div>
  );
}
