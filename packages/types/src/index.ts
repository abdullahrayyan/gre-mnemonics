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

export interface AchievementDto {
  key: string;
  name: string;
  description: string;
  tier: string;
  icon: string | null;
  status: 'IN_PROGRESS' | 'EARNED';
  progress: number;
  target: number;
  earnedAt: string | null;
}

export interface LeaderboardEntryDto {
  rank: number;
  name: string;
  totalXp: number;
  level: number;
  isCurrentUser: boolean;
}

export type ReviewRatingValue = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export type QuizTypeValue =
  | 'WORD_TO_MEANING'
  | 'MEANING_TO_WORD'
  | 'SYNONYM'
  | 'ANTONYM'
  | 'SENTENCE_COMPLETION'
  | 'FILL_IN_BLANK'
  | 'ROOT'
  | 'MNEMONIC_RECALL'
  | 'TIMED'
  | 'MIXED';

export interface QuizQuestionDto {
  attemptId: string;
  type: string;
  prompt: string;
  options: string[];
}

export interface StartedQuizDto {
  quizId: string;
  type: string;
  totalQuestions: number;
  questions: QuizQuestionDto[];
}

export interface QuizSummaryDto {
  quizId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpAwarded: number;
}

export interface AnswerResultDto {
  isCorrect: boolean;
  correctAnswer: string;
  completed: boolean;
  summary?: QuizSummaryDto;
}

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

// ── Community (Phase 11) ────────────────────────────────────────────────────

/** A community-submitted mnemonic for a word. */
export interface CommunityMnemonicDto {
  id: string;
  wordId: string;
  word: string;
  authorId: string;
  authorName: string;
  content: string;
  type: string;
  upvotes: number;
  downvotes: number;
  score: number;
  status: string;
  commentCount: number;
  /** The viewer's vote on this mnemonic: 1, -1, or 0 (anonymous → 0). */
  viewerVote: number;
  createdAt: string;
}

/** A threaded comment on a community mnemonic. */
export interface CommentDto {
  id: string;
  mnemonicId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: CommentDto[];
}

/** Result of casting a vote. */
export interface VoteResultDto {
  mnemonicId: string;
  upvotes: number;
  downvotes: number;
  score: number;
  viewerVote: number;
}

/** A moderation report (admin view). */
export interface ReportDto {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

/** Platform counts for the admin overview. */
export interface AdminOverviewDto {
  words: number;
  mnemonics: number;
  openReports: number;
  users: number;
}

// ── Billing (Phase 14) ──────────────────────────────────────────────────────

/** The current user's subscription. */
export interface SubscriptionDto {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/** A pricing tier shown on the pricing page. */
export interface PlanInfo {
  plan: string;
  name: string;
  priceCents: number;
  features: string[];
}

/** Result of starting checkout: a Stripe URL to redirect to, or an instant
 * (demo) upgrade when no gateway is configured. */
export interface CheckoutResultDto {
  url: string | null;
  plan: string;
  upgraded: boolean;
}

// ── Notifications (Phase 15) ────────────────────────────────────────────────

/** An in-app notification. */
export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export type CommunitySort = 'new' | 'top';

/** Query parameters for `GET /api/v1/community/mnemonics`. */
export interface CommunityListParams {
  wordId?: string;
  sort?: CommunitySort;
  page?: number;
  pageSize?: number;
}
