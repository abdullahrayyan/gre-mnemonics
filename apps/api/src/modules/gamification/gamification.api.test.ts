import { User } from '@mnemonic/core';
import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import { InMemoryGamificationStore } from './infrastructure/in-memory-gamification.store.js';

const ACHIEVEMENTS: AchievementDto[] = [
  {
    key: 'word-warrior',
    name: 'Word Warrior',
    description: 'Learn 50 words',
    tier: 'BRONZE',
    icon: null,
    status: 'EARNED',
    progress: 50,
    target: 50,
    earnedAt: new Date().toISOString(),
  },
];
const BOARD: LeaderboardEntryDto[] = [
  { rank: 1, name: 'Ada', totalXp: 500, level: 4, isCurrentUser: true },
];

async function buildApp() {
  const users = new InMemoryUserRepository();
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );

  const container = createContainer({
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'user-token': { clerkUserId: 'clerk_user' } }),
    gamificationStore: new InMemoryGamificationStore(ACHIEVEMENTS, BOARD),
    redis: null,
    mnemonicEngine: null,
  });
  return createApp({ container });
}

describe('Gamification API', () => {
  it('401 without auth', async () => {
    expect((await request(await buildApp()).get('/api/v1/gamification/achievements')).status).toBe(
      401,
    );
  });

  it('returns achievements', async () => {
    const res = await request(await buildApp())
      .get('/api/v1/gamification/achievements')
      .set('Authorization', 'Bearer user-token');
    expect(res.status).toBe(200);
    expect(res.body.data[0].key).toBe('word-warrior');
    expect(res.body.data[0].status).toBe('EARNED');
  });

  it('returns the leaderboard', async () => {
    const res = await request(await buildApp())
      .get('/api/v1/gamification/leaderboard')
      .set('Authorization', 'Bearer user-token');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Ada');
    expect(res.body.data[0].isCurrentUser).toBe(true);
  });
});
