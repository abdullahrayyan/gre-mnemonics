import { MnemonicEngine, OpenAiProvider, StubAiProvider, TutorEngine } from '@mnemonic/ai';
import { openaiEnvSchema } from '@mnemonic/config';
import type { CacheStore } from '../shared/cache/cache-store.js';
import { DemoAuthVerifier } from '../modules/auth/demo-auth-verifier.js';
import type { AnalyticsRecorder } from '../modules/analytics/analytics-recorder.port.js';
import { InMemoryCommunityStore } from '../modules/community/infrastructure/in-memory-community.store.js';
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
  DEMO_COMMUNITY_AUTHORS,
  DEMO_COMMUNITY_POSTS,
  DEMO_DISPLAY_NAME,
  DEMO_LEADERBOARD,
  DEMO_TUTOR_REPLY,
  DEMO_USER_ID,
  toWordResponses,
} from './demo-data.js';
import type { Word } from '@mnemonic/core';

const noopAiHistory: AiHistoryRecorder = { async record() {} };
const noopAnalytics: AnalyticsRecorder = { async record() {} };

/**
 * Build the mnemonic + tutor engines. Uses the real OpenAI provider when an
 * OPENAI_API_KEY is configured (loaded from apps/api/.env), otherwise falls back
 * to the deterministic stub so the demo still works fully offline.
 */
function buildDemoAi(cache: CacheStore): {
  mnemonicEngine: MnemonicEngine;
  tutorEngine: TutorEngine;
  live: boolean;
} {
  const parsed = openaiEnvSchema.safeParse(process.env);
  if (parsed.success) {
    const options = {
      apiKey: parsed.data.OPENAI_API_KEY,
      defaultModel: parsed.data.OPENAI_MODEL,
      timeoutMs: parsed.data.OPENAI_REQUEST_TIMEOUT_MS,
    };
    return {
      mnemonicEngine: new MnemonicEngine(new OpenAiProvider(options), {
        model: parsed.data.OPENAI_MODEL,
        cache,
        cacheTtlSeconds: 60 * 60 * 24 * 30,
      }),
      tutorEngine: new TutorEngine(new OpenAiProvider(options), { model: parsed.data.OPENAI_MODEL }),
      live: true,
    };
  }
  return {
    mnemonicEngine: new MnemonicEngine(new StubAiProvider('{}'), {
      model: 'demo-stub',
      cache,
      cacheTtlSeconds: 3600,
    }),
    tutorEngine: new TutorEngine(new StubAiProvider(DEMO_TUTOR_REPLY), { model: 'demo-stub' }),
    live: false,
  };
}

/** Build a community store pre-populated with a small demo feed + threads. */
function buildDemoCommunity(words: Word[], now: Date): InMemoryCommunityStore {
  const wordById = new Map(words.map((w) => [w.id, w.word]));
  const resolveAuthor = (id: string): string =>
    id === DEMO_USER_ID ? DEMO_DISPLAY_NAME : (DEMO_COMMUNITY_AUTHORS[id] ?? 'Learner');
  const store = new InMemoryCommunityStore((id) => wordById.get(id) ?? 'word', resolveAuthor);

  let seq = 0;
  const nextId = (prefix: string): string => `demo-${prefix}-${(seq += 1)}`;
  const at = (minutesAgo: number): Date => new Date(now.getTime() - minutesAgo * 60_000);

  DEMO_COMMUNITY_POSTS.forEach((post, index) => {
    const word = words.find((w) => w.word.toLowerCase() === post.word.toLowerCase());
    if (!word) return;
    const mnemonicId = nextId('cm');
    const votes: Record<string, number> = {};
    for (const voter of post.upvoters) votes[voter] = 1;
    store.seedMnemonic({
      id: mnemonicId,
      wordId: word.id,
      word: word.word,
      authorId: post.authorId,
      authorName: resolveAuthor(post.authorId),
      content: post.content,
      createdAt: at((index + 1) * 90),
      votes,
    });
    let cSeq = 0;
    for (const comment of post.comments ?? []) {
      const commentId = nextId('cc');
      store.seedComment({
        id: commentId,
        mnemonicId,
        authorId: comment.authorId,
        parentId: null,
        content: comment.content,
        authorName: resolveAuthor(comment.authorId),
        createdAt: at((index + 1) * 90 - (cSeq += 1) * 5),
      });
      for (const reply of comment.replies ?? []) {
        store.seedComment({
          id: nextId('cc'),
          mnemonicId,
          authorId: reply.authorId,
          parentId: commentId,
          content: reply.content,
          authorName: resolveAuthor(reply.authorId),
          createdAt: at((index + 1) * 90 - (cSeq += 1) * 5),
        });
      }
    }
  });

  return store;
}

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

  // AI: real OpenAI when a key is configured, deterministic stub otherwise.
  const { mnemonicEngine, tutorEngine, live: aiLive } = buildDemoAi(cache);

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
    communityStore: buildDemoCommunity(words, now),
  });

  logger.info(
    { words: words.length, demoUser: DEMO_CLERK_ID, ai: aiLive ? 'openai' : 'stub' },
    'Demo container assembled (in-memory, zero infra)',
  );

  return container;
}
