'use client';

import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs';
import { Button, Card, cn } from '@mnemonic/ui';
import { useState } from 'react';
import { streamTutor } from '@/lib/tutor-stream';

const ACTIONS = [
  { action: 'EXPLAIN', label: 'Explain' },
  { action: 'ANOTHER_MNEMONIC', label: 'Another mnemonic' },
  { action: 'HINDI', label: 'In Hindi' },
  { action: 'GRE_EXAMPLE', label: 'GRE example' },
  { action: 'ROOT', label: 'Root' },
  { action: 'COMPARE', label: 'Compare' },
] as const;

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function TutorChat() {
  const { getToken } = useAuth();
  const [word, setWord] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  const appendToLast = (token: string) => {
    setMessages((current) => {
      const copy = [...current];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant')
        copy[copy.length - 1] = { ...last, content: last.content + token };
      return copy;
    });
  };

  const send = async (options: { text?: string; action?: string }) => {
    if (streaming) return;
    const userText = options.text ?? (options.action ? '' : input.trim());
    const history: ChatMessage[] = userText
      ? [...messages, { role: 'user', content: userText }]
      : messages;

    setInput('');
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const token = await getToken();
      await streamTutor(
        { messages: history, word: word || undefined, action: options.action },
        token ?? '',
        appendToLast,
      );
    } catch {
      setMessages((current) => {
        const copy = [...current];
        const last = copy[copy.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          copy[copy.length - 1] = {
            ...last,
            content: '⚠️ Tutor unavailable — set OPENAI_API_KEY on the API.',
          };
        }
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        value={word}
        onChange={(event) => setWord(event.target.value)}
        placeholder="Word (optional) — e.g. bolster"
        className={INPUT_CLASS}
      />

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((quick) => (
          <Button
            key={quick.action}
            size="sm"
            variant="outline"
            disabled={streaming}
            onClick={() => void send({ action: quick.action })}
          >
            {quick.label}
          </Button>
        ))}
      </div>

      <Card className="min-h-[320px] space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">
            Ask about a word, or tap a quick action to start.
          </p>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'text-right' : ''}>
              <span
                className={cn(
                  'inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 dark:bg-white/10',
                )}
              >
                {message.content || '…'}
              </span>
            </div>
          ))
        )}
      </Card>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send({});
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything…"
          className={INPUT_CLASS}
        />
        <Button type="submit" disabled={streaming || input.trim().length === 0}>
          Send
        </Button>
      </form>
    </div>
  );
}

export default function TutorPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">AI Tutor</h1>
      <SignedOut>
        <Card className="space-y-4 text-center">
          <p>Sign in to chat with the AI tutor.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <TutorChat />
      </SignedIn>
    </div>
  );
}
