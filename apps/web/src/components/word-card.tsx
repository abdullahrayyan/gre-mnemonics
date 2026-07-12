import type { WordDto } from '@mnemonic/types';
import { Badge, Card } from '@mnemonic/ui';

const DIFFICULTY_TONE: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  BEGINNER: 'success',
  EASY: 'success',
  MEDIUM: 'info',
  HARD: 'warning',
  EXPERT: 'danger',
};

export function WordCard({ word }: { word: WordDto }) {
  return (
    <Card className="flex h-full flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-semibold">{word.word}</h3>
        <Badge tone={DIFFICULTY_TONE[word.difficulty] ?? 'info'}>{word.difficulty}</Badge>
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {word.partOfSpeech.toLowerCase()}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{word.meaning}</p>
      <div className="mt-auto space-y-2">
        {word.ai.englishMnemonic ? (
          <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <span className="font-semibold text-slate-900 dark:text-white">English:</span>{' '}
            {word.ai.englishMnemonic}
          </p>
        ) : null}
        {word.ai.hinglishMnemonic ? (
          <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
            <span className="font-semibold">Hinglish:</span> {word.ai.hinglishMnemonic}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
