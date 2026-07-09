'use client';

import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import type {
  AnswerResultDto,
  QuizSummaryDto,
  QuizTypeValue,
  StartedQuizDto,
} from '@mnemonic/types';
import { Button, Card, CardTitle, cn } from '@mnemonic/ui';
import { useState } from 'react';
import { useAnswerQuestion, useStartQuiz } from '@/hooks/use-quiz';

const QUIZ_TYPES: { value: QuizTypeValue; label: string }[] = [
  { value: 'MIXED', label: 'Mixed' },
  { value: 'WORD_TO_MEANING', label: 'Word → Meaning' },
  { value: 'MEANING_TO_WORD', label: 'Meaning → Word' },
  { value: 'SYNONYM', label: 'Synonyms' },
  { value: 'ANTONYM', label: 'Antonyms' },
  { value: 'FILL_IN_BLANK', label: 'Fill in the blank' },
  { value: 'ROOT', label: 'Roots' },
  { value: 'MNEMONIC_RECALL', label: 'Mnemonic recall' },
  { value: 'TIMED', label: 'Timed challenge' },
];

function Setup({
  onStart,
  isPending,
}: {
  onStart: (type: QuizTypeValue) => void;
  isPending: boolean;
}) {
  return (
    <Card className="space-y-4">
      <CardTitle>Choose a quiz</CardTitle>
      <div className="grid gap-2 sm:grid-cols-3">
        {QUIZ_TYPES.map((type) => (
          <Button
            key={type.value}
            variant="outline"
            disabled={isPending}
            onClick={() => onStart(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function Results({ summary, onRestart }: { summary: QuizSummaryDto; onRestart: () => void }) {
  return (
    <Card className="space-y-3 text-center">
      <p className="text-lg font-semibold">Quiz complete! 🎉</p>
      <p className="text-5xl font-bold text-gradient">{summary.scorePercent}%</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {summary.correctCount} / {summary.totalQuestions} correct · +{summary.xpAwarded} XP
      </p>
      <div>
        <Button onClick={onRestart}>New quiz</Button>
      </div>
    </Card>
  );
}

function Session({
  quiz,
  onDone,
}: {
  quiz: StartedQuizDto;
  onDone: (summary: QuizSummaryDto) => void;
}) {
  const answer = useAnswerQuestion();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResultDto | null>(null);

  const question = quiz.questions[index];
  if (!question) return null;

  const choose = async (option: string) => {
    if (result) return;
    setSelected(option);
    const res = await answer.mutateAsync({
      quizId: quiz.quizId,
      attemptId: question.attemptId,
      userAnswer: option,
    });
    setResult(res.data);
  };

  const next = () => {
    if (result?.completed && result.summary) {
      onDone(result.summary);
      return;
    }
    setResult(null);
    setSelected(null);
    setIndex((current) => current + 1);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-sm text-slate-500">
        Question {index + 1} of {quiz.totalQuestions}
      </div>
      <Card>
        <p className="text-lg font-medium">{question.prompt}</p>
      </Card>
      <div className="grid gap-2">
        {question.options.map((option) => {
          const isCorrect = result?.correctAnswer === option;
          const isWrongPick = result && option === selected && !isCorrect;
          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(result) || answer.isPending}
              onClick={() => void choose(option)}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                'border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10',
                result && isCorrect && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
                isWrongPick && 'border-rose-400 bg-rose-50 dark:bg-rose-500/10',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {result ? (
        <div className="flex items-center justify-between">
          <span className={result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
            {result.isCorrect ? 'Correct!' : 'Not quite.'}
          </span>
          <Button onClick={next}>{result.completed ? 'See results' : 'Next'}</Button>
        </div>
      ) : null}
    </div>
  );
}

export default function QuizPage() {
  const start = useStartQuiz();
  const [quiz, setQuiz] = useState<StartedQuizDto | null>(null);
  const [summary, setSummary] = useState<QuizSummaryDto | null>(null);

  const onStart = async (type: QuizTypeValue) => {
    const res = await start.mutateAsync({ type, count: 10 });
    setSummary(null);
    setQuiz(res.data);
  };
  const restart = () => {
    setQuiz(null);
    setSummary(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Quiz</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to take a quiz.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        {start.isError ? (
          <p className="mb-4 text-sm text-rose-500">
            Couldn’t start the quiz — seed some words first (<code>pnpm db:seed:gre</code>).
          </p>
        ) : null}
        {summary ? (
          <Results summary={summary} onRestart={restart} />
        ) : quiz ? (
          <Session quiz={quiz} onDone={setSummary} />
        ) : (
          <Setup onStart={onStart} isPending={start.isPending} />
        )}
      </SignedIn>
    </div>
  );
}
