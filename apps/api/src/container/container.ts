import { randomUUID } from 'node:crypto';
import { MnemonicEngine, OpenAiProvider } from '@mnemonic/ai';
import { openaiEnvSchema } from '@mnemonic/config';
import type { WordRepository } from '@mnemonic/core';
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
import type { AiHistoryRecorder } from '../modules/words/application/ai-history.port.js';
import { CreateWordUseCase } from '../modules/words/application/create-word.usecase.js';
import { DeleteWordUseCase } from '../modules/words/application/delete-word.usecase.js';
import { GenerateWordMnemonicsUseCase } from '../modules/words/application/generate-word-mnemonics.usecase.js';
import { GetWordUseCase } from '../modules/words/application/get-word.usecase.js';
import { SearchWordsUseCase } from '../modules/words/application/search-words.usecase.js';
import { UpdateWordUseCase } from '../modules/words/application/update-word.usecase.js';
import { CachedWordRepository } from '../modules/words/infrastructure/cached-word.repository.js';
import { PrismaAiHistoryRecorder } from '../modules/words/infrastructure/prisma-ai-history.recorder.js';

export interface WordUseCases {
  create: CreateWordUseCase;
  get: GetWordUseCase;
  search: SearchWordsUseCase;
  update: UpdateWordUseCase;
  remove: DeleteWordUseCase;
  generate: GenerateWordMnemonicsUseCase;
}

export interface Container {
  prisma: PrismaClient;
  redis: Redis | null;
  cache: CacheStore;
  wordRepository: WordRepository;
  aiHistoryRecorder: AiHistoryRecorder;
  mnemonicEngine: MnemonicEngine | null;
  generateId: () => string;
  words: WordUseCases;
}

/** Build the AI engine from env, or `null` when no OpenAI key is configured. */
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

/**
 * Assemble the application graph. Overrides let tests inject fakes (in-memory
 * repository, stub AI engine, no-op history) without touching real I/O.
 */
export function createContainer(overrides: Partial<Container> = {}): Container {
  const prisma = overrides.prisma ?? sharedPrisma;
  const redis = overrides.redis !== undefined ? overrides.redis : getRedis();
  const cache = overrides.cache ?? (redis ? new RedisCacheStore(redis) : new InMemoryCacheStore());

  const wordRepository =
    overrides.wordRepository ?? new CachedWordRepository(new PrismaWordRepository(prisma), cache);
  const aiHistoryRecorder = overrides.aiHistoryRecorder ?? new PrismaAiHistoryRecorder(prisma);
  const mnemonicEngine =
    overrides.mnemonicEngine !== undefined ? overrides.mnemonicEngine : createMnemonicEngine(cache);
  const generateId = overrides.generateId ?? (() => randomUUID());

  const words: WordUseCases = overrides.words ?? {
    create: new CreateWordUseCase(wordRepository, generateId),
    get: new GetWordUseCase(wordRepository),
    search: new SearchWordsUseCase(wordRepository),
    update: new UpdateWordUseCase(wordRepository),
    remove: new DeleteWordUseCase(wordRepository),
    generate: new GenerateWordMnemonicsUseCase(wordRepository, mnemonicEngine, aiHistoryRecorder),
  };

  return {
    prisma,
    redis,
    cache,
    wordRepository,
    aiHistoryRecorder,
    mnemonicEngine,
    generateId,
    words,
  };
}
