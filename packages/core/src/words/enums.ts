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

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES = Object.values(UserRole);
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as string[]).includes(value);
}

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export const USER_STATUSES = Object.values(UserStatus);

export const SubscriptionPlan = {
  FREE: 'FREE',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];
export const SUBSCRIPTION_PLANS = Object.values(SubscriptionPlan);

/** Moderation lifecycle for community-submitted content. */
export const ModerationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
} as const;
export type ModerationStatus = (typeof ModerationStatus)[keyof typeof ModerationStatus];
export const MODERATION_STATUSES = Object.values(ModerationStatus);

export const ReportTargetType = {
  MNEMONIC: 'MNEMONIC',
  COMMENT: 'COMMENT',
  WORD: 'WORD',
  USER: 'USER',
} as const;
export type ReportTargetType = (typeof ReportTargetType)[keyof typeof ReportTargetType];
export const REPORT_TARGET_TYPES = Object.values(ReportTargetType);

export const ReportReason = {
  SPAM: 'SPAM',
  OFFENSIVE: 'OFFENSIVE',
  INCORRECT: 'INCORRECT',
  PLAGIARISM: 'PLAGIARISM',
  OTHER: 'OTHER',
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];
export const REPORT_REASONS = Object.values(ReportReason);

export const ReportStatus = {
  OPEN: 'OPEN',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
export const REPORT_STATUSES = Object.values(ReportStatus);

/** SM-2 recall grades used by the spaced-repetition scheduler. */
export const ReviewRating = {
  AGAIN: 'AGAIN',
  HARD: 'HARD',
  GOOD: 'GOOD',
  EASY: 'EASY',
} as const;
export type ReviewRating = (typeof ReviewRating)[keyof typeof ReviewRating];
export const REVIEW_RATINGS = Object.values(ReviewRating);
export function isReviewRating(value: unknown): value is ReviewRating {
  return typeof value === 'string' && (REVIEW_RATINGS as string[]).includes(value);
}

/** A learner's mastery status for a word. */
export const LearningStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  REVIEW: 'REVIEW',
  MASTERED: 'MASTERED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type LearningStatus = (typeof LearningStatus)[keyof typeof LearningStatus];
export const LEARNING_STATUSES = Object.values(LearningStatus);

/** Where a review/study action originated. */
export const StudySource = {
  FLASHCARD: 'FLASHCARD',
  QUIZ: 'QUIZ',
  TUTOR: 'TUTOR',
  IMPORT: 'IMPORT',
} as const;
export type StudySource = (typeof StudySource)[keyof typeof StudySource];
export const STUDY_SOURCES = Object.values(StudySource);
