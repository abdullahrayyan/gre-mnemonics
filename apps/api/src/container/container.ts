import { randomUUID } from 'node:crypto';
import { MnemonicEngine, OpenAiProvider, TutorEngine } from '@mnemonic/ai';
import { clerkEnvSchema, openaiEnvSchema } from '@mnemonic/config';
import type { UserRepository, WordRepository } from '@mnemonic/core';
import {
  PrismaWordRepository,
  prisma as sharedPrisma,
  type PrismaClient,
} from '@mnemonic/database';
import type { Redis } from 'ioredis';
import { getRedis } from '../config/redis.js';
import { InMemoryCacheStore, type CacheStore } from '../shared/cache/cache-store.js';
import { RedisCacheStore } from '../shared/cache/redis-cache-store.js';
import { logger } from '../shared/logger.js';
import type { AuthVerifier } from '../modules/auth/auth-verifier.port.js';
import { ClerkAuthVerifier } from '../modules/auth/clerk-auth-verifier.js';
import { StubAuthVerifier } from '../modules/auth/stub-auth-verifier.js';
import { SvixWebhookVerifier } from '../modules/auth/svix-webhook-verifier.js';
import type { WebhookVerifier } from '../modules/auth/webhook-verifier.port.js';
import type { AiHistoryRecorder } from '../modules/words/application/ai-history.port.js';
import { CreateWordUseCase } from '../modules/words/application/create-word.usecase.js';
import { DeleteWordUseCase } from '../modules/words/application/delete-word.usecase.js';
import { GenerateWordMnemonicsUseCase } from '../modules/words/application/generate-word-mnemonics.usecase.js';
import { GetWordUseCase } from '../modules/words/application/get-word.usecase.js';
import { SearchWordsUseCase } from '../modules/words/application/search-words.usecase.js';
import { UpdateWordUseCase } from '../modules/words/application/update-word.usecase.js';
import { CachedWordRepository } from '../modules/words/infrastructure/cached-word.repository.js';
import { PrismaAiHistoryRecorder } from '../modules/words/infrastructure/prisma-ai-history.recorder.js';
import type { ProfileRepository } from '../modules/users/application/profile.port.js';
import { SyncClerkUserUseCase } from '../modules/users/application/sync-clerk-user.usecase.js';
import { GetMeUseCase, UpdateProfileUseCase } from '../modules/users/application/user.usecases.js';
import { PrismaProfileRepository } from '../modules/users/infrastructure/prisma-profile.repository.js';
import { PrismaUserRepository } from '../modules/users/infrastructure/prisma-user.repository.js';
import type { ReviewStore } from '../modules/reviews/application/review-store.port.js';
import {
  GetReviewQueueUseCase,
  SubmitReviewUseCase,
} from '../modules/reviews/application/review.usecases.js';
import { PrismaReviewStore } from '../modules/reviews/infrastructure/prisma-review.store.js';
import type { AnalyticsRecorder } from '../modules/analytics/analytics-recorder.port.js';
import { PrismaAnalyticsRecorder } from '../modules/analytics/prisma-analytics.recorder.js';
import { GetDashboardUseCase } from '../modules/stats/application/get-dashboard.usecase.js';
import type { StatsStore } from '../modules/stats/application/stats-store.port.js';
import { PrismaStatsStore } from '../modules/stats/infrastructure/prisma-stats.store.js';
import type { QuizStore } from '../modules/quizzes/application/quiz-store.port.js';
import {
  AnswerQuestionUseCase,
  GetWeakWordsUseCase,
  StartQuizUseCase,
} from '../modules/quizzes/application/quiz.usecases.js';
import { PrismaQuizStore } from '../modules/quizzes/infrastructure/prisma-quiz.store.js';
import type { GamificationStore } from '../modules/gamification/application/gamification-store.port.js';
import {
  GetLeaderboardUseCase,
  ListAchievementsUseCase,
} from '../modules/gamification/application/gamification.usecases.js';
import { PrismaGamificationStore } from '../modules/gamification/infrastructure/prisma-gamification.store.js';
import type { CommunityStore } from '../modules/community/application/community-store.port.js';
import {
  AddCommentUseCase,
  ListCommentsUseCase,
  ListCommunityMnemonicsUseCase,
  ReportContentUseCase,
  SubmitMnemonicUseCase,
  VoteMnemonicUseCase,
} from '../modules/community/application/community.usecases.js';
import { PrismaCommunityStore } from '../modules/community/infrastructure/prisma-community.store.js';

export interface WordUseCases {
  create: CreateWordUseCase;
  get: GetWordUseCase;
  search: SearchWordsUseCase;
  update: UpdateWordUseCase;
  remove: DeleteWordUseCase;
  generate: GenerateWordMnemonicsUseCase;
}

export interface UserUseCases {
  syncUser: SyncClerkUserUseCase;
  getMe: GetMeUseCase;
  updateProfile: UpdateProfileUseCase;
}

export interface ReviewUseCases {
  getQueue: GetReviewQueueUseCase;
  submit: SubmitReviewUseCase;
}

export interface StatsUseCases {
  getDashboard: GetDashboardUseCase;
}

export interface QuizUseCases {
  start: StartQuizUseCase;
  answer: AnswerQuestionUseCase;
  weakWords: GetWeakWordsUseCase;
}

export interface GamificationUseCases {
  listAchievements: ListAchievementsUseCase;
  getLeaderboard: GetLeaderboardUseCase;
}

export interface CommunityUseCases {
  list: ListCommunityMnemonicsUseCase;
  submit: SubmitMnemonicUseCase;
  vote: VoteMnemonicUseCase;
  listComments: ListCommentsUseCase;
  addComment: AddCommentUseCase;
  report: ReportContentUseCase;
}

export interface Container {
  prisma: PrismaClient;
  redis: Redis | null;
  cache: CacheStore;
  wordRepository: WordRepository;
  aiHistoryRecorder: AiHistoryRecorder;
  mnemonicEngine: MnemonicEngine | null;
  tutorEngine: TutorEngine | null;
  authVerifier: AuthVerifier;
  webhookVerifier: WebhookVerifier;
  userRepository: UserRepository;
  profileRepository: ProfileRepository;
  reviewStore: ReviewStore;
  statsStore: StatsStore;
  analyticsRecorder: AnalyticsRecorder;
  quizStore: QuizStore;
  gamificationStore: GamificationStore;
  communityStore: CommunityStore;
  generateId: () => string;
  words: WordUseCases;
  users: UserUseCases;
  reviews: ReviewUseCases;
  stats: StatsUseCases;
  quizzes: QuizUseCases;
  gamification: GamificationUseCases;
  community: CommunityUseCases;
}

function createMnemonicEngine(cache: CacheStore): MnemonicEngine | null {
  const parsed = openaiEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    logger.info('OpenAI not configured; AI generation disabled');
    return null;
  }
  const provider = new OpenAiProvider({
    apiKey: parsed.data.OPENAI_API_KEY,
    defaultModel: parsed.data.OPENAI_MODEL,
    timeoutMs: parsed.data.OPENAI_REQUEST_TIMEOUT_MS,
  });
  return new MnemonicEngine(provider, {
    model: parsed.data.OPENAI_MODEL,
    cache,
    cacheTtlSeconds: 60 * 60 * 24 * 30,
  });
}

function createTutorEngine(): TutorEngine | null {
  const parsed = openaiEnvSchema.safeParse(process.env);
  if (!parsed.success) return null;
  const provider = new OpenAiProvider({
    apiKey: parsed.data.OPENAI_API_KEY,
    defaultModel: parsed.data.OPENAI_MODEL,
    timeoutMs: parsed.data.OPENAI_REQUEST_TIMEOUT_MS,
  });
  return new TutorEngine(provider, { model: parsed.data.OPENAI_MODEL });
}

function createAuthVerifier(): AuthVerifier {
  const parsed = clerkEnvSchema.safeParse(process.env);
  if (parsed.success) return new ClerkAuthVerifier(parsed.data.CLERK_SECRET_KEY);
  logger.info('Clerk not configured; all authenticated requests will be rejected');
  return new StubAuthVerifier();
}

function createWebhookVerifier(): WebhookVerifier {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (secret) return new SvixWebhookVerifier(secret);
  logger.info('Clerk webhook secret not configured; webhooks will be rejected');
  return { verify: () => null };
}

/** Assemble the application graph. Overrides inject fakes in tests. */
export function createContainer(overrides: Partial<Container> = {}): Container {
  const prisma = overrides.prisma ?? sharedPrisma;
  const redis = overrides.redis !== undefined ? overrides.redis : getRedis();
  const cache = overrides.cache ?? (redis ? new RedisCacheStore(redis) : new InMemoryCacheStore());
  const generateId = overrides.generateId ?? (() => randomUUID());

  const wordRepository =
    overrides.wordRepository ?? new CachedWordRepository(new PrismaWordRepository(prisma), cache);
  const aiHistoryRecorder = overrides.aiHistoryRecorder ?? new PrismaAiHistoryRecorder(prisma);
  const mnemonicEngine =
    overrides.mnemonicEngine !== undefined ? overrides.mnemonicEngine : createMnemonicEngine(cache);
  const tutorEngine =
    overrides.tutorEngine !== undefined ? overrides.tutorEngine : createTutorEngine();

  const authVerifier = overrides.authVerifier ?? createAuthVerifier();
  const webhookVerifier = overrides.webhookVerifier ?? createWebhookVerifier();
  const userRepository = overrides.userRepository ?? new PrismaUserRepository(prisma);
  const profileRepository = overrides.profileRepository ?? new PrismaProfileRepository(prisma);

  const words: WordUseCases = overrides.words ?? {
    create: new CreateWordUseCase(wordRepository, generateId),
    get: new GetWordUseCase(wordRepository),
    search: new SearchWordsUseCase(wordRepository),
    update: new UpdateWordUseCase(wordRepository),
    remove: new DeleteWordUseCase(wordRepository),
    generate: new GenerateWordMnemonicsUseCase(wordRepository, mnemonicEngine, aiHistoryRecorder),
  };

  const users: UserUseCases = overrides.users ?? {
    syncUser: new SyncClerkUserUseCase(userRepository, generateId),
    getMe: new GetMeUseCase(userRepository, profileRepository),
    updateProfile: new UpdateProfileUseCase(profileRepository),
  };

  const reviewStore = overrides.reviewStore ?? new PrismaReviewStore(prisma);
  const reviews: ReviewUseCases = overrides.reviews ?? {
    getQueue: new GetReviewQueueUseCase(reviewStore),
    submit: new SubmitReviewUseCase(reviewStore),
  };

  const statsStore = overrides.statsStore ?? new PrismaStatsStore(prisma);
  const analyticsRecorder = overrides.analyticsRecorder ?? new PrismaAnalyticsRecorder(prisma);
  const stats: StatsUseCases = overrides.stats ?? {
    getDashboard: new GetDashboardUseCase(statsStore),
  };

  const quizStore = overrides.quizStore ?? new PrismaQuizStore(prisma);
  const quizzes: QuizUseCases = overrides.quizzes ?? {
    start: new StartQuizUseCase(wordRepository, quizStore),
    answer: new AnswerQuestionUseCase(quizStore),
    weakWords: new GetWeakWordsUseCase(quizStore),
  };

  const gamificationStore = overrides.gamificationStore ?? new PrismaGamificationStore(prisma);
  const gamification: GamificationUseCases = overrides.gamification ?? {
    listAchievements: new ListAchievementsUseCase(gamificationStore),
    getLeaderboard: new GetLeaderboardUseCase(gamificationStore),
  };

  const communityStore = overrides.communityStore ?? new PrismaCommunityStore(prisma);
  const community: CommunityUseCases = overrides.community ?? {
    list: new ListCommunityMnemonicsUseCase(communityStore),
    submit: new SubmitMnemonicUseCase(communityStore, generateId),
    vote: new VoteMnemonicUseCase(communityStore),
    listComments: new ListCommentsUseCase(communityStore),
    addComment: new AddCommentUseCase(communityStore, generateId),
    report: new ReportContentUseCase(communityStore, generateId),
  };

  return {
    prisma,
    redis,
    cache,
    wordRepository,
    aiHistoryRecorder,
    mnemonicEngine,
    tutorEngine,
    authVerifier,
    webhookVerifier,
    userRepository,
    profileRepository,
    reviewStore,
    statsStore,
    analyticsRecorder,
    quizStore,
    gamificationStore,
    communityStore,
    generateId,
    words,
    users,
    reviews,
    stats,
    quizzes,
    gamification,
    community,
  };
}
