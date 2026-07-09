import { StubAiProvider, TutorEngine } from '@mnemonic/ai';
import { User } from '@mnemonic/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import { NoopAiHistoryRecorder } from '../words/infrastructure/prisma-ai-history.recorder.js';

async function buildApp(tutorEngine: TutorEngine | null) {
  const users = new InMemoryUserRepository();
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );

  const container = createContainer({
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'user-token': { clerkUserId: 'clerk_user' } }),
    tutorEngine,
    aiHistoryRecorder: new NoopAiHistoryRecorder(),
    redis: null,
    mnemonicEngine: null,
  });
  return createApp({ container });
}

describe('Tutor API', () => {
  it('401 without auth', async () => {
    const app = await buildApp(new TutorEngine(new StubAiProvider('hi')));
    const res = await request(app)
      .post('/api/v1/tutor/chat')
      .send({ word: 'bolster', action: 'EXPLAIN' });
    expect(res.status).toBe(401);
  });

  it('streams the tutor reply as SSE', async () => {
    const app = await buildApp(new TutorEngine(new StubAiProvider('Bolster means to support.')));
    const res = await request(app)
      .post('/api/v1/tutor/chat')
      .set('Authorization', 'Bearer user-token')
      .send({ word: 'bolster', action: 'EXPLAIN' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('Bolster');
    expect(res.text).toContain('[DONE]');
  });

  it('503 when the tutor is not configured', async () => {
    const app = await buildApp(null);
    const res = await request(app)
      .post('/api/v1/tutor/chat')
      .set('Authorization', 'Bearer user-token')
      .send({ word: 'bolster', action: 'EXPLAIN' });
    expect(res.status).toBe(503);
  });
});
