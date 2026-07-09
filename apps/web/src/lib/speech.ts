'use client';

/**
 * Thin wrappers over the browser Web Speech APIs — text-to-speech for
 * pronunciation (native + slow) and speech recognition for AI pronunciation
 * scoring. All client-side; no backend required.
 */

interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}
interface RecognitionErrorEvent {
  error: string;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionSupported(): boolean {
  return recognitionCtor() !== null;
}

/** Speak text aloud at the given rate (1 = native, ~0.6 = slow). */
export function speak(text: string, rate = 1): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

/** Listen once and resolve with the recognized transcript (best alternative). */
export function recognizeOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      reject(new Error('Speech recognition is not supported in this browser.'));
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let settled = false;
    recognition.onresult = (event) => {
      settled = true;
      resolve(event.results?.[0]?.[0]?.transcript ?? '');
    };
    recognition.onerror = (event) => {
      if (!settled) reject(new Error(event.error));
    };
    recognition.onend = () => {
      if (!settled) resolve('');
    };
    recognition.start();
  });
}

/** Compare a spoken transcript to the target word. */
export function scorePronunciation(
  target: string,
  transcript: string,
): 'correct' | 'close' | 'wrong' {
  const clean = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');
  const t = clean(target);
  const heard = clean(transcript);
  if (!heard) return 'wrong';
  if (heard === t || heard.includes(t) || t.includes(heard)) return 'correct';
  // crude edit-distance closeness
  let matches = 0;
  for (let i = 0; i < Math.min(t.length, heard.length); i += 1) {
    if (t[i] === heard[i]) matches += 1;
  }
  return matches / Math.max(t.length, heard.length) >= 0.6 ? 'close' : 'wrong';
}
