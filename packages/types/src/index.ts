/**
 * @mnemonic/types — the HTTP contract shared between the API and clients.
 * Framework-free, dependency-free response/DTO shapes so the web app (and future
 * mobile apps) consume the API with full type-safety.
 */

/** Standard success envelope: `{ data }`. */
export interface ApiSuccess<T> {
  data: T;
}

/** Standard error envelope emitted by the API's error handler. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

/** Pagination metadata returned by list endpoints. */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** A paginated list response: `{ data, pagination }`. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/** AI-generated learning content attached to a word. */
export interface WordAiContentDto {
  story: string | null;
  hinglishMnemonic: string | null;
  englishMnemonic: string | null;
  memoryTrick: string | null;
  visualMemoryPrompt: string | null;
  imagePrompt: string | null;
}

/** A vocabulary word as returned by the API. */
export interface WordDto {
  id: string;
  word: string;
  slug: string;
  pronunciation: string | null;
  ipa: string | null;
  difficulty: string;
  frequency: number | null;
  partOfSpeech: string;
  meaning: string;
  hindiMeaning: string | null;
  synonyms: string[];
  antonyms: string[];
  rootWord: string | null;
  prefix: string | null;
  suffix: string | null;
  etymology: string | null;
  exampleSentence: string | null;
  commonMistakes: string | null;
  ai: WordAiContentDto;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** A user's profile. */
export interface ProfileDto {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  nativeLanguage: string;
  targetExam: string;
  dailyWordGoal: number;
  timezone: string;
  bio: string | null;
  preferences: Record<string, unknown>;
}

/** The authenticated user's own account (`GET /api/v1/me`). */
export interface MeDto {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileDto | null;
}

export interface WeeklyActivityPoint {
  date: string;
  reviews: number;
}

/** Aggregated learner dashboard (`GET /api/v1/stats/dashboard`). */
export interface DashboardDto {
  dailyGoal: number;
  completedToday: number;
  remainingToday: number;
  reviewsDue: number;
  totalXp: number;
  level: number;
  levelFraction: number;
  currentStreak: number;
  longestStreak: number;
  wordsLearned: number;
  wordsMastered: number;
  retentionPercent: number;
  monthlyReviews: number;
  weeklyActivity: WeeklyActivityPoint[];
}

export type ReviewRatingValue = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

/** A card in the review queue. */
export interface ReviewCardDto {
  word: WordDto;
  dueAt: string | null;
  repetitions: number;
  intervalDays: number;
  isNew: boolean;
}

/** The result of submitting a review. */
export interface ReviewOutcomeDto {
  wordId: string;
  status: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  xpAwarded: number;
}

/** Query parameters accepted by `GET /api/v1/words`. */
export interface WordSearchParams {
  page?: number;
  pageSize?: number;
  term?: string;
  difficulty?: string;
  partOfSpeech?: string;
  examType?: string;
  status?: string;
  hasMnemonics?: boolean;
  sort?: 'word' | 'difficulty' | 'frequency' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}
