import type { AiMessage } from '../provider/ai-provider.js';

export type TutorAction =
  | 'EXPLAIN'
  | 'ANOTHER_MNEMONIC'
  | 'HINDI'
  | 'GRE_EXAMPLE'
  | 'ROOT'
  | 'ETYMOLOGY'
  | 'ANALOGY'
  | 'COMPARE'
  | 'QUIZ';

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorRequest {
  messages: TutorMessage[];
  word?: string;
  action?: TutorAction;
}

const SYSTEM_PROMPT = `You are "Mnemonic Master", a friendly, witty GRE vocabulary tutor. You explain
words clearly and memorably, offer Hinglish mnemonics like a funny desi friend,
and adapt to the learner. Keep replies focused, encouraging, and concise.`;

const ACTION_DIRECTIVES: Record<TutorAction, string> = {
  EXPLAIN: 'Explain the word simply and memorably.',
  ANOTHER_MNEMONIC: 'Offer a fresh Hinglish mnemonic, different from the obvious one.',
  HINDI: 'Explain the word in Hindi (Devanagari).',
  GRE_EXAMPLE: 'Give a GRE-style example sentence and a usage tip.',
  ROOT: 'Explain the root and how it builds the meaning.',
  ETYMOLOGY: 'Explain the etymology and origin.',
  ANALOGY: 'Explain the word with a vivid analogy.',
  COMPARE: 'Compare this word with commonly confused, similar words.',
  QUIZ: 'Ask the learner one quick quiz question about the word, then wait.',
};

/** Build the chat messages for a tutor turn. */
export function buildTutorMessages(request: TutorRequest): AiMessage[] {
  const messages: AiMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

  const context: string[] = [];
  if (request.word) context.push(`The current word is "${request.word}".`);
  if (request.action) context.push(ACTION_DIRECTIVES[request.action]);
  if (context.length > 0) messages.push({ role: 'system', content: context.join(' ') });

  for (const message of request.messages) {
    messages.push({ role: message.role, content: message.content });
  }

  // Ensure there is at least one user turn for the model to respond to.
  const hasUser = request.messages.some((message) => message.role === 'user');
  if (!hasUser) {
    messages.push({ role: 'user', content: `Help me with "${request.word ?? 'this word'}".` });
  }

  return messages;
}
