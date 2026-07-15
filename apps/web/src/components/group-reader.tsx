'use client';

import { Badge, Button, Card, cn } from '@mnemonic/ui';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Word } from '@/lib/words';
import { useDoneGroups } from '@/lib/progress';

/** Horizontal travel (px) needed to count as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 55;

export function GroupReader({ group, words }: { group: number; words: Word[] }) {
  const router = useRouter();
  const { loaded, isDone, markDone } = useDoneGroups();
  const complete = loaded && isDone(group);

  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const direction = useRef(1);
  const startX = useRef(0);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const next = Math.min(words.length - 1, Math.max(0, current + delta));
        if (next !== current) direction.current = delta;
        return next;
      });
    },
    [words.length],
  );

  // Arrow keys on laptop.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Pointer events cover touch (phone swipe) and mouse (laptop drag) in one path.
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
    if (dragX <= -SWIPE_THRESHOLD) go(1);
    else if (dragX >= SWIPE_THRESHOLD) go(-1);
    setDragging(false);
    setDragX(0);
  };

  const finish = () => {
    markDone(group);
    router.push(`/group/${group}/revise`);
  };

  const word = words[index];
  const atEnd = index === words.length - 1;
  if (!word) return null;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> All groups
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Group {group}</h1>
          {complete ? <Badge tone="success">Done</Badge> : null}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Slider: swipe on phone, drag or arrow keys on laptop. */}
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
            <Card className="min-h-[20rem] cursor-grab select-none space-y-4 active:cursor-grabbing">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{word.word}</h2>
                {word.pos ? (
                  <span className="text-xs uppercase tracking-wide text-slate-400">{word.pos}</span>
                ) : null}
              </div>

              <p className="text-slate-700 dark:text-slate-200">
                {word.meaning}
                {word.hindi ? (
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {' '}
                    ({word.hindi})
                  </span>
                ) : null}
              </p>

              {word.mnemonic ? (
                <p className="rounded-xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
                  💡 {word.mnemonic}
                </p>
              ) : null}

              {word.hinglish ? (
                <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
                  {word.hinglish}
                </p>
              ) : null}
            </Card>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{index + 1}</span> /{' '}
          {words.length}
          <span className="ml-2 hidden text-xs text-slate-400 sm:inline">swipe or ← →</span>
        </span>
        <Button variant="outline" size="sm" onClick={() => go(1)} disabled={atEnd}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center pt-2">
        <Button size="lg" onClick={finish} className="shadow-lg">
          <Check className="h-5 w-5" />
          {complete ? 'Revise again' : 'Done — revise these words'}
        </Button>
      </div>
    </div>
  );
}
