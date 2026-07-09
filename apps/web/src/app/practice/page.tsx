'use client';

import { Badge, Button, Card, Skeleton } from '@mnemonic/ui';
import { Mic, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAllWords } from '@/hooks/use-words';
import { recognitionSupported, recognizeOnce, scorePronunciation, speak } from '@/lib/speech';

type Result = { verdict: 'correct' | 'close' | 'wrong'; heard: string } | null;

const VERDICT = {
  correct: { label: 'Perfect! 🎉', tone: 'success' as const },
  close: { label: 'Close — try again', tone: 'warning' as const },
  wrong: { label: 'Not quite', tone: 'danger' as const },
};

function Trainer({ words }: { words: { word: string; meaning: string; pronunciation: string | null }[] }) {
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const supported = recognitionSupported();

  const current = words[index];

  const next = () => {
    setResult(null);
    setIndex((value) => (value + 1) % words.length);
  };

  const listen = async () => {
    if (!current) return;
    setResult(null);
    setListening(true);
    try {
      const transcript = await recognizeOnce();
      setResult({ verdict: scorePronunciation(current.word, transcript), heard: transcript });
    } catch {
      setResult({ verdict: 'wrong', heard: '' });
    } finally {
      setListening(false);
    }
  };

  if (!current) return null;

  return (
    <Card className="space-y-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Say this word</p>
        <h2 className="mt-1 text-4xl font-bold tracking-tight">{current.word}</h2>
        {current.pronunciation ? (
          <p className="mt-1 text-slate-500 dark:text-slate-400">/{current.pronunciation}/</p>
        ) : null}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{current.meaning}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => speak(current.word, 1)}>
          <Volume2 className="h-4 w-4" /> Listen
        </Button>
        <Button variant="outline" size="sm" onClick={() => speak(current.word, 0.6)}>
          <Volume2 className="h-4 w-4" /> Slow
        </Button>
        <Button size="sm" disabled={!supported || listening} onClick={() => void listen()}>
          <Mic className="h-4 w-4" /> {listening ? 'Listening…' : 'Say it'}
        </Button>
      </div>

      {!supported ? (
        <p className="text-xs text-slate-400">
          Speech recognition isn’t available in this browser — Listen/Slow still work.
        </p>
      ) : null}

      {result ? (
        <div className="space-y-1">
          <Badge tone={VERDICT[result.verdict].tone}>{VERDICT[result.verdict].label}</Badge>
          {result.heard ? (
            <p className="text-xs text-slate-400">Heard: “{result.heard}”</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <Button variant="ghost" size="sm" onClick={next}>
          Next word →
        </Button>
      </div>
    </Card>
  );
}

export default function PracticePage() {
  const { data, isLoading } = useAllWords({ status: 'PUBLISHED', sort: 'word', order: 'asc' });
  const [pool, setPool] = useState<typeof data>(undefined);

  // Shuffle once when data arrives (Math.random is fine on the client).
  useEffect(() => {
    if (data && !pool) {
      setPool([...data].sort(() => Math.random() - 0.5));
    }
  }, [data, pool]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pronunciation</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Hear each word, then say it back — we’ll check your pronunciation.
        </p>
      </div>
      {isLoading || !pool ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <Trainer
          words={pool.map((w) => ({ word: w.word, meaning: w.meaning, pronunciation: w.pronunciation }))}
        />
      )}
    </div>
  );
}
