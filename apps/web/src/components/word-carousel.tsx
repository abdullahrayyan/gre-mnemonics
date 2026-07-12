'use client';

import type { WordDto } from '@mnemonic/types';
import { Badge, Button } from '@mnemonic/ui';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

const DIFFICULTY_TONE: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  BEGINNER: 'success',
  EASY: 'success',
  MEDIUM: 'info',
  HARD: 'warning',
  EXPERT: 'danger',
};

const slide = {
  enter: (dir: number) => ({ x: dir >= 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
};

/** Speak the word aloud with the browser's speech synthesis (best-effort). */
function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

interface WordCarouselProps {
  words: WordDto[];
  index: number;
  onIndexChange: (index: number) => void;
}

/**
 * A large, focused flashcard for the current word. Navigate with the ← / →
 * arrow keys, the prev/next buttons, or by dragging the card. The full word
 * grid below drives the same index.
 */
export function WordCarousel({ words, index, onIndexChange }: WordCarouselProps) {
  const previousIndex = useRef(index);
  const direction = index >= previousIndex.current ? 1 : -1;
  useEffect(() => {
    previousIndex.current = index;
  }, [index]);

  const go = useCallback(
    (delta: number) => {
      if (words.length === 0) return;
      onIndexChange((index + delta + words.length) % words.length);
    },
    [index, words.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
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

  const word = words[index];
  if (!word) return null;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <motion.div
            key={word.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
            className="min-h-[26rem] cursor-grab space-y-5 p-6 active:cursor-grabbing sm:min-h-[28rem] sm:p-10"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</h2>
                <div className="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  {word.pronunciation ? <span>/{word.pronunciation}/</span> : null}
                  <span className="uppercase tracking-wide">{word.partOfSpeech.toLowerCase()}</span>
                  <button
                    type="button"
                    onClick={() => speak(word.word)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                    aria-label="Pronounce"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Badge tone={DIFFICULTY_TONE[word.difficulty] ?? 'info'}>{word.difficulty}</Badge>
            </div>

            <p className="text-lg text-slate-700 dark:text-slate-200">{word.meaning}</p>
            {word.hindiMeaning ? (
              <p className="text-base text-slate-500 dark:text-slate-400">{word.hindiMeaning}</p>
            ) : null}

            {word.ai.englishMnemonic ? (
              <p className="rounded-2xl bg-slate-100 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200">
                <span className="font-semibold text-slate-900 dark:text-white">English:</span>{' '}
                {word.ai.englishMnemonic}
              </p>
            ) : null}
            {word.ai.hinglishMnemonic ? (
              <p className="rounded-2xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
                <span className="font-semibold">Hinglish:</span> {word.ai.hinglishMnemonic}
              </p>
            ) : null}

            {word.exampleSentence ? (
              <p className="border-l-2 border-slate-200 pl-4 text-sm italic text-slate-500 dark:border-white/15 dark:text-slate-400">
                “{word.exampleSentence}”
              </p>
            ) : null}

            {word.synonyms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {word.synonyms.slice(0, 6).map((syn) => (
                  <span
                    key={syn}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => go(-1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{index + 1}</span> /{' '}
          {words.length}
          <span className="ml-3 hidden text-xs text-slate-400 sm:inline">← → arrow keys</span>
        </span>
        <Button variant="outline" size="sm" onClick={() => go(1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
