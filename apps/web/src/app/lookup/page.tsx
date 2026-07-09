'use client';

import type { WordDto } from '@mnemonic/types';
import { Badge, Button, Card, Spinner } from '@mnemonic/ui';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { speak } from '@/lib/speech';

function Result({ word }: { word: WordDto }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{word.word}</h2>
            <button
              type="button"
              onClick={() => speak(word.word)}
              className="text-indigo-500 hover:text-indigo-600"
              aria-label="Pronounce"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            {word.partOfSpeech.toLowerCase()}
            {word.pronunciation ? ` · /${word.pronunciation}/` : ''}
          </p>
        </div>
        <Badge tone="info">{word.difficulty}</Badge>
      </div>
      <p className="text-slate-700 dark:text-slate-200">{word.meaning}</p>
      {word.hindiMeaning ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{word.hindiMeaning}</p>
      ) : null}
      {word.ai.hinglishMnemonic ? (
        <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">
          💡 {word.ai.hinglishMnemonic}
        </p>
      ) : null}
      {word.ai.englishMnemonic ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">🔤 {word.ai.englishMnemonic}</p>
      ) : null}
      {word.exampleSentence ? (
        <p className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-500 dark:border-white/15 dark:text-slate-400">
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
    </Card>
  );
}

function Lookup() {
  const { getToken } = useAuth();
  const [word, setWord] = useState('');
  const lookup = useMutation({
    mutationFn: async (term: string) => api.words.preview(term, (await getToken()) ?? ''),
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (word.trim()) lookup.mutate(word.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="Any English word — even outside the GRE list…"
          className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5"
        />
        <Button type="submit" disabled={lookup.isPending || !word.trim()}>
          <Sparkles className="h-4 w-4" /> {lookup.isPending ? 'Generating…' : 'Look up'}
        </Button>
      </form>

      {lookup.isPending ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Spinner /> Asking the AI to craft mnemonics…
        </div>
      ) : null}
      {lookup.isError ? (
        <p className="text-sm text-rose-500">
          Couldn’t generate this word. The AI needs OPENAI_API_KEY on the API.
        </p>
      ) : null}
      {lookup.data ? <Result word={lookup.data.data} /> : null}
    </div>
  );
}

export default function LookupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instant lookup</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Generate a full mnemonic entry for any word on demand — not just the GRE list.
        </p>
      </div>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to generate mnemonics for any word.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Lookup />
      </SignedIn>
    </div>
  );
}
