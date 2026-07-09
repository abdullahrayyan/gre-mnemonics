import { MnemonicEngine, StubAiProvider, TutorEngine } from '@mnemonic/ai';
import { DemoAuthVerifier } from '../modules/auth/demo-auth-verifier.js';
import type { AnalyticsRecorder } from '../modules/analytics/analytics-recorder.port.js';
import { InMemoryGamificationStore } from '../modules/gamification/infrastructure/in-memory-gamification.store.js';
import { InMemoryQuizStore } from '../modules/quizzes/infrastructure/in-memory-quiz.store.js';
import { InMemoryReviewStore } from '../modules/reviews/infrastructure/in-memory-review.store.js';
import { InMemoryStatsStore } from '../modules/stats/infrastructure/in-memory-stats.store.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../modules/users/infrastructure/in-memory-repositories.js';
import type { AiHistoryRecorder } from '../modules/words/application/ai-history.port.js';
import { InMemoryWordRepository } from '../modules/words/infrastructure/in-memory-word.repository.js';
import { InMemoryCacheStore } from '../shared/cache/cache-store.js';
import { logger } from '../shared/logger.js';
import { createContainer, type Container } from './container.js';
import {
  buildDemoStats,
  buildDemoUser,
  buildDemoWords,
  DEMO_ACHIEVEMENTS,
  DEMO_CLERK_ID,
  DEMO_DISPLAY_NAME,
  DEMO_LEADERBOARD,
  DEMO_TUTOR_REPLY,
  DEMO_USER_ID,
  toWordResponses,
} from './demo-data.js';

const noopAiHistory: AiHistoryRecorder = { async record() {} };
const noopAnalytics: AnalyticsRecorder = { async record() {} };

/**
 * Assemble a fully in-memory container for the zero-infra demo server: seeded
 * words, a seeded demo user/profile, stub AI (mnemonic + tutor), and a demo auth
 * verifier that accepts any token. No Postgres, Redis, OpenAI, or Clerk required.
 */
export function createDemoContainer(now: Date = new Date()): Container {
  const cache = new InMemoryCacheStore();

  // Seed the vocabulary catalog.
  const words = buildDemoWords(now);
  const wordRepository = new InMemoryWordRepository();
  for (const word of words) void wordRepository.create(word);

  // Seed the demo account + profile.
  const userRepository = new InMemoryUserRepository();
  void userRepository.create(buildDemoUser(now));
  const profileRepository = new InMemoryProfileRepository();
  profileRepository.seed(DEMO_USER_ID);
  void profileRepository.update(DEMO_USER_ID, { displayName: DEMO_DISPLAY_NAME });

  // Stub AI: mnemonic generation + a streamed tutor reply, both offline.
  const mnemonicEngine = new MnemonicEngine(new StubAiProvider('{}'), {
    model: 'demo-stub',
    cache,
    cacheTtlSeconds: 3600,
  });
  const tutorEngine = new TutorEngine(new StubAiProvider(DEMO_TUTOR_REPLY), { model: 'demo-stub' });

  const container = createContainer({
    redis: null,
    cache,
    wordRepository,
    aiHistoryRecorder: noopAiHistory,
    mnemonicEngine,
    tutorEngine,
    authVerifier: new DemoAuthVerifier(DEMO_CLERK_ID),
    webhookVerifier: { verify: () => null },
    userRepository,
    profileRepository,
    reviewStore: new InMemoryReviewStore(toWordResponses(words)),
    statsStore: new InMemoryStatsStore(buildDemoStats(now)),
    analyticsRecorder: noopAnalytics,
    quizStore: new InMemoryQuizStore(),
    gamificationStore: new InMemoryGamificationStore(DEMO_ACHIEVEMENTS, DEMO_LEADERBOARD),
  });

  logger.info(
    { words: words.length, demoUser: DEMO_CLERK_ID },
    'Demo container assembled (in-memory, zero infra)',
  );

  return container;
}
