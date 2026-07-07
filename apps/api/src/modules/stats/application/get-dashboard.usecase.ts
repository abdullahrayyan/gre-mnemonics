import { levelProgress } from '@mnemonic/core';
import type { DashboardDto } from '@mnemonic/types';
import type { StatsStore } from './stats-store.port.js';
import { computeStreak } from './streak.util.js';

/** Assemble the learner dashboard from raw aggregates + derived values. */
export class GetDashboardUseCase {
  constructor(private readonly store: StatsStore) {}

  async execute(userId: string, now: Date = new Date()): Promise<DashboardDto> {
    const raw = await this.store.getRawStats(userId, now);
    const progress = levelProgress(raw.totalXp);
    const currentStreak = computeStreak(raw.reviewDates, now);
    const retentionPercent =
      raw.monthlyReviews > 0 ? Math.round((raw.monthlyCorrect / raw.monthlyReviews) * 100) : 0;

    return {
      dailyGoal: raw.dailyGoal,
      completedToday: raw.completedToday,
      remainingToday: Math.max(0, raw.dailyGoal - raw.completedToday),
      reviewsDue: raw.reviewsDue,
      totalXp: raw.totalXp,
      level: progress.level,
      levelFraction: progress.fraction,
      currentStreak,
      longestStreak: Math.max(raw.longestStreak, currentStreak),
      wordsLearned: raw.wordsLearned,
      wordsMastered: raw.wordsMastered,
      retentionPercent,
      monthlyReviews: raw.monthlyReviews,
      weeklyActivity: raw.weeklyActivity,
    };
  }
}
