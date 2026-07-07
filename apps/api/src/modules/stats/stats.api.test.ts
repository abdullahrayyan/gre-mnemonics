import { User } from '@mnemonic/core';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { NoopAnalyticsRecorder } from '../analytics/prisma-analytics.recorder.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import type { RawStats } from './application/stats-store.port.js';
import { InMemoryStatsStore } from './infrastructure/in-memory-stats.store.js';

const USER = 'Bearer user-token';
const todayKey = new Date().toISOString().slice(0, 10);
const yesterdayKey = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const RAW: RawStats = {
  dailyGoal: 20,
  completedToday: 5,
  reviewsDue: 12,
  totalXp: 250,
  longestStreak: 4,
  wordsLearned: 50,
  wordsMastered: 10,
  monthlyReviews: 100,
  monthlyCorrect: 85,
  weeklyActivity: Array.from({ length: 7 }, (_, i) => ({ date: `2026-07-0${i + 1}`, reviews: i })),
  reviewDates: [todayKey, yesterdayKey],
};

async function setup() {
  const users = new InMemoryUserRepository();
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );

  const container = createContainer({
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'user-token': { clerkUserId: 'clerk_user' } }),
    statsStore: new InMemoryStatsStore(RAW),
    analyticsRecorder: new NoopAnalyticsRecorder(),
    redis: null,
    mnemonicEngine: null,
  });
  return createApp({ container });
}

describe('Stats + Analytics API', () => {
  let app: Awaited<ReturnType<typeof setup>>;

  beforeEach(async () => {
    app = await setup();
  });

  it('401 for the dashboard without auth', async () => {
    expect((await request(app).get('/api/v1/stats/dashboard')).status).toBe(401);
  });

  it('returns the computed dashboard', async () => {
    const res = await request(app).get('/api/v1/stats/dashboard').set('Authorization', USER);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      dailyGoal: 20,
      completedToday: 5,
      remainingToday: 15,
      reviewsDue: 12,
      totalXp: 250,
      level: 3,
      retentionPercent: 85,
      currentStreak: 2,
      longestStreak: 4,
    });
    expect(res.body.data.weeklyActivity).toHaveLength(7);
  });

  it('accepts analytics events (202, no auth required)', async () => {
    const res = await request(app).post('/api/v1/analytics').send({ name: 'page_view' });
    expect(res.status).toBe(202);
    expect(res.body.data.accepted).toBe(true);
  });
});
