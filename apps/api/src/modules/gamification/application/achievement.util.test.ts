import { describe, expect, it } from 'vitest';
import {
  computeAchievements,
  evaluateBadge,
  type BadgeDefinition,
  type LearnerMetrics,
} from './achievement.util.js';

const metrics: LearnerMetrics = {
  wordsLearned: 120,
  wordsMastered: 30,
  perfectQuizzes: 3,
  currentStreak: 8,
};

const badge = (key: string, criteria: Record<string, unknown>): BadgeDefinition => ({
  key,
  name: key,
  description: '',
  tier: 'BRONZE',
  icon: null,
  criteria,
});

describe('evaluateBadge', () => {
  it('maps criteria to the right metric', () => {
    expect(evaluateBadge({ streak: 7 }, metrics)).toEqual({ value: 8, target: 7 });
    expect(evaluateBadge({ perfectQuizzes: 10 }, metrics)).toEqual({ value: 3, target: 10 });
    expect(evaluateBadge({ wordsLearned: 100 }, metrics)).toEqual({ value: 120, target: 100 });
    expect(evaluateBadge({ examMastered: 'GRE', words: 1000 }, metrics)).toEqual({
      value: 30,
      target: 1000,
    });
  });
});

describe('computeAchievements', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('earns badges when the threshold is met and flags newly earned', () => {
    const { views, newlyEarned } = computeAchievements(
      [
        badge('century', { wordsLearned: 100 }),
        badge('streak7', { streak: 7 }),
        badge('ninja', { perfectQuizzes: 10 }),
      ],
      metrics,
      new Map(),
      now,
    );
    expect(newlyEarned).toEqual(['century', 'streak7']);
    expect(views.find((v) => v.key === 'century')?.status).toBe('EARNED');
    expect(views.find((v) => v.key === 'ninja')?.status).toBe('IN_PROGRESS');
    expect(views.find((v) => v.key === 'ninja')?.progress).toBe(3);
  });

  it('keeps already-earned badges and their earnedAt', () => {
    const earnedAt = new Date('2025-12-01T00:00:00.000Z');
    const { views, newlyEarned } = computeAchievements(
      [badge('century', { wordsLearned: 100 })],
      metrics,
      new Map([['century', { earned: true, earnedAt }]]),
      now,
    );
    expect(newlyEarned).toEqual([]);
    expect(views[0]?.earnedAt).toBe(earnedAt.toISOString());
  });
});
