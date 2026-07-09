import type { Word } from '../words/word.entity.js';
import { QuizQuestionKind } from './enums.js';

export interface GeneratedQuizQuestion {
  wordId: string;
  type: QuizQuestionKind;
  prompt: string;
  /** Shuffled choices; always contains `correctAnswer`. */
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GenerateQuizOptions {
  /** Question kinds to draw from. Defaults to all kinds. */
  types?: QuizQuestionKind[];
  /** Number of questions to produce (default: one per word). */
  count?: number;
  /** Choices per question (default 4, min 2). */
  optionCount?: number;
  /** RNG for shuffling/selection (injectable for deterministic tests). */
  random?: () => number;
}

interface WordView {
  id: string;
  word: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string | null;
  rootWord: string | null;
  hinglishMnemonic: string | null;
}

function toView(word: Word): WordView {
  const p = word.toJSON();
  return {
    id: p.id,
    word: p.word,
    meaning: p.meaning,
    synonyms: p.synonyms,
    antonyms: p.antonyms,
    exampleSentence: p.exampleSentence,
    rootWord: p.rootWord,
    hinglishMnemonic: p.ai.hinglishMnemonic,
  };
}

function shuffle<T>(input: readonly T[], random: () => number): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = array[i]!;
    array[i] = array[j]!;
    array[j] = tmp;
  }
  return array;
}

function supports(view: WordView, kind: QuizQuestionKind): boolean {
  switch (kind) {
    case QuizQuestionKind.SYNONYM:
      return view.synonyms.length > 0;
    case QuizQuestionKind.ANTONYM:
      return view.antonyms.length > 0;
    case QuizQuestionKind.SENTENCE_COMPLETION:
    case QuizQuestionKind.FILL_IN_BLANK:
      return Boolean(view.exampleSentence?.toLowerCase().includes(view.word.toLowerCase()));
    case QuizQuestionKind.ROOT:
      return Boolean(view.rootWord);
    case QuizQuestionKind.MNEMONIC_RECALL:
      return Boolean(view.hinglishMnemonic);
    default:
      return true;
  }
}

function blankOut(sentence: string, word: string): string {
  return sentence.replace(new RegExp(word, 'ig'), '____');
}

function buildQuestion(
  view: WordView,
  kind: QuizQuestionKind,
  pool: WordView[],
  optionCount: number,
  random: () => number,
): GeneratedQuizQuestion | null {
  const others = pool.filter((candidate) => candidate.id !== view.id);

  const distractorsFrom = (pick: (candidate: WordView) => string | null): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const candidate of shuffle(others, random)) {
      const value = pick(candidate);
      if (value && !seen.has(value.toLowerCase())) {
        seen.add(value.toLowerCase());
        result.push(value);
      }
      if (result.length >= optionCount - 1) break;
    }
    return result;
  };

  let prompt = '';
  let correctAnswer = '';
  let explanation = '';
  let distractors: string[] = [];

  switch (kind) {
    case QuizQuestionKind.WORD_TO_MEANING:
      prompt = `What does "${view.word}" mean?`;
      correctAnswer = view.meaning;
      explanation = `"${view.word}" means ${view.meaning}.`;
      distractors = distractorsFrom((c) => c.meaning);
      break;
    case QuizQuestionKind.MEANING_TO_WORD:
      prompt = `Which word means "${view.meaning}"?`;
      correctAnswer = view.word;
      explanation = `"${view.word}" means ${view.meaning}.`;
      distractors = distractorsFrom((c) => c.word);
      break;
    case QuizQuestionKind.SYNONYM:
      prompt = `Which is a synonym of "${view.word}"?`;
      correctAnswer = view.synonyms[0] ?? '';
      explanation = `A synonym of "${view.word}" is ${correctAnswer}.`;
      distractors = distractorsFrom((c) => c.word);
      break;
    case QuizQuestionKind.ANTONYM:
      prompt = `Which is an antonym of "${view.word}"?`;
      correctAnswer = view.antonyms[0] ?? '';
      explanation = `An antonym of "${view.word}" is ${correctAnswer}.`;
      distractors = distractorsFrom((c) => c.word);
      break;
    case QuizQuestionKind.SENTENCE_COMPLETION:
    case QuizQuestionKind.FILL_IN_BLANK:
      prompt = `Fill in the blank: ${blankOut(view.exampleSentence ?? '', view.word)}`;
      correctAnswer = view.word;
      explanation = `The answer is "${view.word}".`;
      distractors = distractorsFrom((c) => c.word);
      break;
    case QuizQuestionKind.ROOT:
      prompt = `What is the root of "${view.word}"?`;
      correctAnswer = view.rootWord ?? '';
      explanation = `The root of "${view.word}" is ${correctAnswer}.`;
      distractors = distractorsFrom((c) => c.rootWord);
      break;
    case QuizQuestionKind.MNEMONIC_RECALL:
      prompt = `Which word fits this mnemonic? "${view.hinglishMnemonic}"`;
      correctAnswer = view.word;
      explanation = `The word is "${view.word}".`;
      distractors = distractorsFrom((c) => c.word);
      break;
  }

  if (!correctAnswer || distractors.length === 0) return null;

  return {
    wordId: view.id,
    type: kind,
    prompt,
    options: shuffle([correctAnswer, ...distractors], random),
    correctAnswer,
    explanation,
  };
}

/**
 * Generate a multiple-choice quiz from a pool of words. Each target word is
 * assigned a supported question kind; distractors are drawn from the other
 * words. Deterministic when a seeded `random` is supplied.
 */
export function generateQuizQuestions(
  words: Word[],
  options: GenerateQuizOptions = {},
): GeneratedQuizQuestion[] {
  const random = options.random ?? Math.random;
  const optionCount = Math.max(2, options.optionCount ?? 4);
  const allowed =
    options.types && options.types.length > 0
      ? options.types
      : [...Object.values(QuizQuestionKind)];

  const views = words.map(toView);
  const targets = options.count ? views.slice(0, options.count) : views;

  const questions: GeneratedQuizQuestion[] = [];
  let cursor = 0;

  for (const view of targets) {
    const supported = allowed.filter((kind) => supports(view, kind));
    const candidates = supported.length > 0 ? supported : [QuizQuestionKind.WORD_TO_MEANING];
    const kind = candidates[cursor % candidates.length]!;
    cursor += 1;

    const question =
      buildQuestion(view, kind, views, optionCount, random) ??
      buildQuestion(view, QuizQuestionKind.WORD_TO_MEANING, views, optionCount, random);
    if (question) questions.push(question);
  }

  return questions;
}
