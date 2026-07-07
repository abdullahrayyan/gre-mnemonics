import type { WeeklyActivityPoint } from '@mnemonic/types';

/** Raw per-user aggregates read from persistence; derived values are computed in the use-case. */
export interface RawStats {
  dailyGoal: number;
  completedToday: number;
  reviewsDue: number;
  totalXp: number;
  longestStreak: number;
  wordsLearned: number;
  wordsMastered: number;
  monthlyReviews: number;
  monthlyCorrect: number;
  weeklyActivity: WeeklyActivityPoint[];
  /** Distinct review dates (YYYY-MM-DD, UTC) over the last ~60 days, for streaks. */
  reviewDates: string[];
}

export interface StatsStore {
  getRawStats(userId: string, now: Date): Promise<RawStats>;
}
