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
      {word.ai.hinglishMnemonic ? (
        <p className="mt-auto rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
          💡 {word.ai.hinglishMnemonic}
        </p>
      ) : null}
    </Card>
  );
}
