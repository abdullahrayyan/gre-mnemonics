/**
 * Domain enumerations for the vocabulary catalog. These are the single source
 * of truth; the Prisma schema mirrors them at the database level. Each is a
 * `const` object plus a derived union type, a value list, and a type guard.
 */

export const Difficulty = {
  BEGINNER: 'BEGINNER',
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  EXPERT: 'EXPERT',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
export const DIFFICULTIES = Object.values(Difficulty);
export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as string[]).includes(value);
}

export const PartOfSpeech = {
  NOUN: 'NOUN',
  VERB: 'VERB',
  ADJECTIVE: 'ADJECTIVE',
  ADVERB: 'ADVERB',
  PRONOUN: 'PRONOUN',
  PREPOSITION: 'PREPOSITION',
  CONJUNCTION: 'CONJUNCTION',
  INTERJECTION: 'INTERJECTION',
  DETERMINER: 'DETERMINER',
  PHRASE: 'PHRASE',
  OTHER: 'OTHER',
} as const;
export type PartOfSpeech = (typeof PartOfSpeech)[keyof typeof PartOfSpeech];
export const PARTS_OF_SPEECH = Object.values(PartOfSpeech);
export function isPartOfSpeech(value: unknown): value is PartOfSpeech {
  return typeof value === 'string' && (PARTS_OF_SPEECH as string[]).includes(value);
}

export const ExamType = {
  GRE: 'GRE',
  TOEFL: 'TOEFL',
  IELTS: 'IELTS',
  SAT: 'SAT',
  GMAT: 'GMAT',
  CAT: 'CAT',
  UPSC: 'UPSC',
  SSC: 'SSC',
  GENERAL: 'GENERAL',
} as const;
export type ExamType = (typeof ExamType)[keyof typeof ExamType];
export const EXAM_TYPES = Object.values(ExamType);
export function isExamType(value: unknown): value is ExamType {
  return typeof value === 'string' && (EXAM_TYPES as string[]).includes(value);
}

export const Language = {
  EN: 'EN',
  HI: 'HI',
  HINGLISH: 'HINGLISH',
} as const;
export type Language = (typeof Language)[keyof typeof Language];
export const LANGUAGES = Object.values(Language);

export const WordStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type WordStatus = (typeof WordStatus)[keyof typeof WordStatus];
export const WORD_STATUSES = Object.values(WordStatus);

export const MnemonicType = {
  HINGLISH: 'HINGLISH',
  ENGLISH: 'ENGLISH',
  STORY: 'STORY',
  VISUAL: 'VISUAL',
  TRICK: 'TRICK',
  ROOT: 'ROOT',
} as const;
export type MnemonicType = (typeof MnemonicType)[keyof typeof MnemonicType];
export const MNEMONIC_TYPES = Object.values(MnemonicType);

/** SM-2 recall grades used by the spaced-repetition scheduler (Phase 6). */
export const ReviewRating = {
  AGAIN: 'AGAIN',
  HARD: 'HARD',
  GOOD: 'GOOD',
  EASY: 'EASY',
} as const;
export type ReviewRating = (typeof ReviewRating)[keyof typeof ReviewRating];
export const REVIEW_RATINGS = Object.values(ReviewRating);
