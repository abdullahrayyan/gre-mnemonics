import { Difficulty, PartOfSpeech, User, Word } from '@mnemonic/core';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import { toWordResponse } from '../words/application/word.dto.js';
import { InMemoryReviewStore } from './infrastructure/in-memory-review.store.js';

const USER = 'Bearer user-token';

function makeWord(id: string, word: string, meaning: string) {
  return toWordResponse(
    Word.create(
      { word, meaning, difficulty: Difficulty.MEDIUM, partOfSpeech: PartOfSpeech.VERB },
      { id },
    ),
  );
}

async function setup() {
  const users = new InMemoryUserRepository();
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );

  const reviewStore = new InMemoryReviewStore([
    makeWord('w1', 'Bolster', 'to support'),
    makeWord('w2', 'Ephemeral', 'short-lived'),
  ]);

  const container = createContainer({
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'user-token': { clerkUserId: 'clerk_user' } }),
    reviewStore,
    redis: null,
    mnemonicEngine: null,
  });

  return { app: createApp({ container }), reviewStore };
}

describe('Reviews API', () => {
  let app: Awaited<ReturnType<typeof setup>>['app'];
  let reviewStore: Awaited<ReturnType<typeof setup>>['reviewStore'];

  beforeEach(async () => {
    ({ app, reviewStore } = await setup());
  });

  it('401 without auth', async () => {
    expect((await request(app).get('/api/v1/reviews/queue')).status).toBe(401);
  });

  it('returns new cards in the queue', async () => {
    const res = await request(app).get('/api/v1/reviews/queue').set('Authorization', USER);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((card: { isNew: boolean }) => card.isNew)).toBe(true);
  });

  it('submits a review, schedules the card, and awards XP', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', USER)
      .send({ wordId: 'w1', rating: 'GOOD' });

    expect(res.status).toBe(201);
    expect(res.body.data.repetitions).toBe(1);
    expect(res.body.data.intervalDays).toBe(1);
    expect(res.body.data.xpAwarded).toBeGreaterThan(0);
    expect(reviewStore.totalXp('u_user')).toBe(res.body.data.xpAwarded);

    // w1 is now scheduled (due tomorrow) — no longer new, not yet due.
    const queue = await request(app).get('/api/v1/reviews/queue').set('Authorization', USER);
    const ids = queue.body.data.map((card: { word: { id: string } }) => card.word.id);
    expect(ids).toContain('w2');
    expect(ids).not.toContain('w1');
  });

  it('validates the rating (422)', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', USER)
      .send({ wordId: 'w1', rating: 'MAYBE' });
    expect(res.status).toBe(422);
  });
});
