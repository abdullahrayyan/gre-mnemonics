'use client';

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import type { ReviewRatingValue } from '@mnemonic/types';
import { Button, Card, Spinner, type ButtonVariant } from '@mnemonic/ui';
import { useState } from 'react';
import { Flashcard } from '@/components/flashcard';
import { useReviewQueue, useSubmitReview } from '@/hooks/use-reviews';

const RATINGS: { rating: ReviewRatingValue; label: string; variant: ButtonVariant }[] = [
  { rating: 'AGAIN', label: 'Again', variant: 'outline' },
  { rating: 'HARD', label: 'Hard', variant: 'outline' },
  { rating: 'GOOD', label: 'Good', variant: 'secondary' },
  { rating: 'EASY', label: 'Easy', variant: 'primary' },
];

function ReviewSession() {
  const queue = useReviewQueue();
  const submit = useSubmitReview();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const cards = queue.data?.data ?? [];
  const card = cards[index];

  if (queue.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (queue.isError) {
    return (
      <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
        Couldn’t load your reviews. Make sure the API is running.
      </p>
    );
  }
  if (cards.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-lg font-semibold">All caught up! 🎉</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No cards are due right now. Come back later or seed more words.
        </p>
      </Card>
    );
  }
  if (!card) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-lg font-semibold">Session complete! 🎉</p>
        <Button
          onClick={() => {
            setIndex(0);
            void queue.refetch();
          }}
        >
          Load more
        </Button>
      </Card>
    );
  }

  const rate = async (rating: ReviewRatingValue) => {
    await submit.mutateAsync({ wordId: card.word.id, rating });
    setRevealed(false);
    setIndex((current) => current + 1);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        {card.isNew ? (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            New
          </span>
        ) : null}
      </div>

      <Flashcard word={card.word} revealed={revealed} onReveal={() => setRevealed(true)} />

      {revealed ? (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((option) => (
            <Button
              key={option.rating}
              variant={option.variant}
              disabled={submit.isPending}
              onClick={() => void rate(option.rating)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : (
        <Button className="w-full" onClick={() => setRevealed(true)}>
          Reveal answer
        </Button>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Review</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to start your spaced-repetition review session.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <ReviewSession />
      </SignedIn>
    </div>
  );
}
