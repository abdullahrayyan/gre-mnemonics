import { MnemonicEngine, StubAiProvider } from '@mnemonic/ai';
import { User, UserRole } from '@mnemonic/core';
import type { PrismaClient } from '@mnemonic/database';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import { InMemoryWordRepository } from './infrastructure/in-memory-word.repository.js';
import { NoopAiHistoryRecorder } from './infrastructure/prisma-ai-history.recorder.js';

const VALID_SET = JSON.stringify({
  hinglishMnemonic: 'Bol Sir! — teacher supports you.',
  englishMnemonic: 'A bolster pillow supports your back.',
  story: 'A student shouts "Bol Sir!" and the teacher backs him up.',
  beginnerExplanation: 'Bolster means to support.',
  hindiExplanation: 'सहारा देना',
  rootExplanation: 'Old English bolster, a cushion.',
  realLifeExample: 'The award bolstered her confidence.',
  visualImagination: 'A giant pillow propping up a wall.',
  memoryTrick: 'Bol + Sir = support.',
  imagePrompt: 'A teacher holding up a wobbling bookshelf.',
  quizQuestions: [
    {
      type: 'WORD_TO_MEANING',
      prompt: 'What does bolster mean?',
      options: ['to support', 'to destroy'],
      correctAnswer: 'to support',
      explanation: 'support',
    },
  ],
});

const wordBody = {
  word: 'Bolster',
  difficulty: 'MEDIUM',
  partOfSpeech: 'VERB',
  meaning: 'to support or strengthen',
};

// Admin auth header for write operations (reads are public).
const ADMIN = 'Bearer admin-token';

async function buildApp(prisma?: PrismaClient) {
  const users = new InMemoryUserRepository();
  await users.create(
    User.create(
      { clerkId: 'clerk_admin', email: 'admin@example.com', role: UserRole.ADMIN },
      { id: 'u_admin' },
    ),
  );

  const container = createContainer({
    wordRepository: new InMemoryWordRepository(),
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'admin-token': { clerkUserId: 'clerk_admin' } }),
    mnemonicEngine: new MnemonicEngine(new StubAiProvider(VALID_SET), { model: 'stub' }),
    aiHistoryRecorder: new NoopAiHistoryRecorder(),
    redis: null,
    ...(prisma ? { prisma } : {}),
  });
  return createApp({ container });
}

describe('Words API', () => {
  it('creates a word (201) and rejects duplicates (409)', async () => {
    const app = await buildApp();
    const created = await request(app)
      .post('/api/v1/words')
      .set('Authorization', ADMIN)
      .send(wordBody);
    expect(created.status).toBe(201);
    expect(created.body.data.slug).toBe('bolster');

    const dup = await request(app).post('/api/v1/words').set('Authorization', ADMIN).send(wordBody);
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('CONFLICT');
  });

  it('validates the body (422)', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/api/v1/words')
      .set('Authorization', ADMIN)
      .send({ word: '', difficulty: 'NOPE' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('fetches by id and slug, 404 when missing', async () => {
    const app = await buildApp();
    const created = await request(app)
      .post('/api/v1/words')
      .set('Authorization', ADMIN)
      .send(wordBody);
    const id = created.body.data.id;

    expect((await request(app).get(`/api/v1/words/${id}`)).status).toBe(200);
    expect((await request(app).get('/api/v1/words/slug/bolster')).status).toBe(200);

    const missing = await request(app).get('/api/v1/words/does-not-exist');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
  });

  it('lists with pagination and term filtering', async () => {
    const app = await buildApp();
    await request(app).post('/api/v1/words').set('Authorization', ADMIN).send(wordBody);
    await request(app)
      .post('/api/v1/words')
      .set('Authorization', ADMIN)
      .send({ ...wordBody, word: 'Ephemeral', partOfSpeech: 'ADJECTIVE', meaning: 'short-lived' });

    const all = await request(app).get('/api/v1/words');
    expect(all.status).toBe(200);
    expect(all.body.pagination.total).toBe(2);

    const filtered = await request(app).get('/api/v1/words').query({ term: 'short' });
    expect(filtered.body.pagination.total).toBe(1);
    expect(filtered.body.data[0].word).toBe('Ephemeral');
  });

  it('updates (200) and deletes (204)', async () => {
    const app = await buildApp();
    const id = (await request(app).post('/api/v1/words').set('Authorization', ADMIN).send(wordBody))
      .body.data.id;

    const updated = await request(app)
      .patch(`/api/v1/words/${id}`)
      .set('Authorization', ADMIN)
      .send({ meaning: 'to prop up' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.meaning).toBe('to prop up');

    expect(
      (await request(app).delete(`/api/v1/words/${id}`).set('Authorization', ADMIN)).status,
    ).toBe(204);
    expect((await request(app).get(`/api/v1/words/${id}`)).status).toBe(404);
  });

  it('generates AI mnemonics for a word (200)', async () => {
    const app = await buildApp();
    const id = (await request(app).post('/api/v1/words').set('Authorization', ADMIN).send(wordBody))
      .body.data.id;

    const res = await request(app).post(`/api/v1/words/${id}/generate`).set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.data.ai.hinglishMnemonic).toContain('Bol Sir');
    expect(res.body.data.ai.visualMemoryPrompt).toContain('pillow');
  });

  it('returns 503 from readiness when the database is down', async () => {
    const downPrisma = {
      $queryRaw: async () => {
        throw new Error('db down');
      },
    } as unknown as PrismaClient;
    const res = await request(await buildApp(downPrisma)).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('not_ready');
  });
});
