'use client';

import type { WordDto } from '@mnemonic/types';
import { Badge } from '@mnemonic/ui';
import { motion } from 'framer-motion';

const FACE =
  'absolute inset-0 rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-md [backface-visibility:hidden] dark:border-white/10 dark:bg-white/5';

export function Flashcard({
  word,
  revealed,
  onReveal,
}: {
  word: WordDto;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="[perspective:1200px]">
      <motion.div
        onClick={onReveal}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-80 w-full cursor-pointer [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className={`${FACE} flex flex-col items-center justify-center gap-3 text-center`}>
          <Badge tone="info">{word.difficulty}</Badge>
          <h2 className="text-4xl font-bold">{word.word}</h2>
          {word.pronunciation ? <p className="text-slate-500">{word.pronunciation}</p> : null}
          <p className="mt-2 text-sm text-slate-400">Tap to reveal</p>
        </div>

        {/* Back */}
        <div className={`${FACE} flex flex-col gap-2 overflow-auto [transform:rotateY(180deg)]`}>
          <h3 className="text-2xl font-bold">{word.word}</h3>
          <p className="text-slate-700 dark:text-slate-200">{word.meaning}</p>
          {word.hindiMeaning ? <p className="text-slate-500">{word.hindiMeaning}</p> : null}
          {word.ai.hinglishMnemonic ? (
            <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
              💡 {word.ai.hinglishMnemonic}
            </p>
          ) : null}
          {word.synonyms.length > 0 ? (
            <p className="text-sm text-slate-500">Synonyms: {word.synonyms.join(', ')}</p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
