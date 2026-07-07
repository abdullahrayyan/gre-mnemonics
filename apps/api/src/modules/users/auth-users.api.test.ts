import { User, UserRole } from '@mnemonic/core';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import { StubWebhookVerifier } from '../auth/stub-webhook-verifier.js';
import { InMemoryWordRepository } from '../words/infrastructure/in-memory-word.repository.js';
import { NoopAiHistoryRecorder } from '../words/infrastructure/prisma-ai-history.recorder.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from './infrastructure/in-memory-repositories.js';

const wordBody = {
  word: 'Bolster',
  difficulty: 'MEDIUM',
  partOfSpeech: 'VERB',
  meaning: 'to support or strengthen',
};

async function setup() {
  const users = new InMemoryUserRepository();
  const profiles = new InMemoryProfileRepository();

  await users.create(
    User.create(
      { clerkId: 'clerk_admin', email: 'admin@example.com', role: UserRole.ADMIN },
      { id: 'u_admin' },
    ),
  );
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );
  profiles.seed('u_admin');
  profiles.seed('u_user');

  const authVerifier = new StubAuthVerifier({
    'admin-token': { clerkUserId: 'clerk_admin' },
    'user-token': { clerkUserId: 'clerk_user' },
    'ghost-token': { clerkUserId: 'clerk_ghost' },
  });

  const container = createContainer({
    userRepository: users,
    profileRepository: profiles,
    wordRepository: new InMemoryWordRepository(),
    authVerifier,
    webhookVerifier: new StubWebhookVerifier(),
    aiHistoryRecorder: new NoopAiHistoryRecorder(),
    mnemonicEngine: null,
    redis: null,
  });

  return { app: createApp({ container }), users };
}

describe('Auth + Users API', () => {
  let app: Awaited<ReturnType<typeof setup>>['app'];
  let users: Awaited<ReturnType<typeof setup>>['users'];

  beforeEach(async () => {
    ({ app, users } = await setup());
  });

  describe('GET /api/v1/me', () => {
    it('401 without a token', async () => {
      expect((await request(app).get('/api/v1/me')).status).toBe(401);
    });

    it('401 for a token with no provisioned user', async () => {
      const res = await request(app).get('/api/v1/me').set('Authorization', 'Bearer ghost-token');
      expect(res.status).toBe(401);
    });

    it('200 with the current user + profile', async () => {
      const res = await request(app).get('/api/v1/me').set('Authorization', 'Bearer user-token');
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@example.com');
      expect(res.body.data.profile.dailyWordGoal).toBe(20);
    });
  });

  describe('RBAC on word writes', () => {
    it('401 without a token', async () => {
      expect((await request(app).post('/api/v1/words').send(wordBody)).status).toBe(401);
    });

    it('403 for a non-admin user', async () => {
      const res = await request(app)
        .post('/api/v1/words')
        .set('Authorization', 'Bearer user-token')
        .send(wordBody);
      expect(res.status).toBe(403);
    });

    it('201 for an admin', async () => {
      const res = await request(app)
        .post('/api/v1/words')
        .set('Authorization', 'Bearer admin-token')
        .send(wordBody);
      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('bolster');
    });

    it('keeps reads public', async () => {
      expect((await request(app).get('/api/v1/words')).status).toBe(200);
    });
  });

  describe('PATCH /api/v1/me/profile', () => {
    it('updates the profile', async () => {
      const res = await request(app)
        .patch('/api/v1/me/profile')
        .set('Authorization', 'Bearer user-token')
        .send({ dailyWordGoal: 30, targetExam: 'TOEFL' });
      expect(res.status).toBe(200);
      expect(res.body.data.dailyWordGoal).toBe(30);
      expect(res.body.data.targetExam).toBe('TOEFL');
    });
  });

  describe('Clerk webhook provisioning', () => {
    it('creates a user on user.created', async () => {
      const event = {
        type: 'user.created',
        data: {
          id: 'clerk_new',
          email_addresses: [{ id: 'e1', email_address: 'new@example.com' }],
          primary_email_address_id: 'e1',
        },
      };
      const res = await request(app)
        .post('/api/webhooks/clerk')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
      const created = await users.findByClerkId('clerk_new');
      expect(created?.email).toBe('new@example.com');
    });
  });
});
