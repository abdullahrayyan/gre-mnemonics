'use client';

import { Button, Card, cn } from '@mnemonic/ui';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Word } from '@/lib/words';

/** Horizontal travel (px) needed to count as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 55;

export function GroupRevision({ group, words }: { group: number; words: Word[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const direction = useRef(1);
  const startX = useRef(0);

  const word = words[index];

  const next = useCallback(() => {
    direction.current = 1;
    setIndex((current) => {
      if (current + 1 >= words.length) {
        setFinished(true);
        return current;
      }
      setRevealed(false);
      return current + 1;
    });
  }, [words.length]);

  const previous = useCallback(() => {
    direction.current = -1;
    setIndex((current) => {
      if (current === 0) return current;
      setRevealed(false);
      return current - 1;
    });
  }, []);

  // Arrow keys on laptop; space/enter reveals.
  useEffect(() => {
    if (finished) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, previous, finished]);

  const onPointerDown = (event: React.PointerEvent) => {
    startX.current = event.clientX;
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  };
  const endDrag = () => {
    if (!dragging) return;
    const travelled = dragX;
    setDragging(false);
    setDragX(0);
    if (travelled <= -SWIPE_THRESHOLD) next();
    else if (travelled >= SWIPE_THRESHOLD) previous();
    else setRevealed(true); // a tap reveals
  };

  const restart = () => {
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    direction.current = 1;
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

      <div
        className="overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? 'none' : 'transform 150ms ease-out',
          }}
        >
          <div
            key={index}
            className={cn(
              direction.current >= 0 ? 'animate-slide-from-right' : 'animate-slide-from-left',
            )}
          >
            <Card className="flex min-h-[22rem] cursor-pointer select-none flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</h2>

              {revealed ? (
                <div className="space-y-3">
                  <p className="text-lg text-slate-700 dark:text-slate-200">
                    {word.meaning}
                    {word.hindi ? (
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {' '}
                        ({word.hindi})
                      </span>
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
          </div>
        </div>
      </div>

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
      <p className="text-center text-xs text-slate-400">
        Swipe or use ← → · tap the card to reveal
      </p>
    </div>
  );
}
