import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type { WeeklyActivityPoint } from '@mnemonic/types';
import type { RawStats, StatsStore } from '../application/stats-store.port.js';

const DAY_MS = 86_400_000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Prisma aggregation for the learner dashboard (one read transaction). */
export class PrismaStatsStore implements StatsStore {
  constructor(private readonly prisma: PrismaClient) {}

  async getRawStats(userId: string, now: Date): Promise<RawStats> {
    const startToday = startOfUtcDay(now);
    const since30 = new Date(now.getTime() - 30 * DAY_MS);
    const since60 = new Date(now.getTime() - 60 * DAY_MS);
    const notAgain = 'AGAIN' as Prisma.ReviewUncheckedCreateInput['rating'];
    const mastered = 'MASTERED' as Prisma.LearningProgressUncheckedCreateInput['status'];

    const [
      profile,
      gamification,
      completedToday,
      reviewsDue,
      wordsLearned,
      wordsMastered,
      monthlyReviews,
      monthlyCorrect,
      recent,
    ] = await this.prisma.$transaction([
      this.prisma.profile.findUnique({ where: { userId }, select: { dailyWordGoal: true } }),
      this.prisma.gamificationProfile.findUnique({
        where: { userId },
        select: { totalXp: true, longestStreak: true },
      }),
      this.prisma.review.count({ where: { userId, reviewedAt: { gte: startToday } } }),
      this.prisma.sm2ReviewSchedule.count({ where: { userId, dueAt: { lte: now } } }),
      this.prisma.learningProgress.count({ where: { userId } }),
      this.prisma.learningProgress.count({ where: { userId, status: mastered } }),
      this.prisma.review.count({ where: { userId, reviewedAt: { gte: since30 } } }),
      this.prisma.review.count({
        where: { userId, reviewedAt: { gte: since30 }, rating: { not: notAgain } },
      }),
      this.prisma.review.findMany({
        where: { userId, reviewedAt: { gte: since60 } },
        select: { reviewedAt: true },
      }),
    ]);

    const weeklyActivity: WeeklyActivityPoint[] = [];
    const weekIndex = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const key = dateKey(new Date(startToday.getTime() - i * DAY_MS));
      weekIndex.set(key, weeklyActivity.length);
      weeklyActivity.push({ date: key, reviews: 0 });
    }

    const dateSet = new Set<string>();
    for (const row of recent) {
      const key = dateKey(row.reviewedAt);
      dateSet.add(key);
      const index = weekIndex.get(key);
      if (index !== undefined) {
        const bucket = weeklyActivity[index];
        if (bucket) bucket.reviews += 1;
      }
    }

    return {
      dailyGoal: profile?.dailyWordGoal ?? 20,
      completedToday,
      reviewsDue,
      totalXp: gamification?.totalXp ?? 0,
      longestStreak: gamification?.longestStreak ?? 0,
      wordsLearned,
      wordsMastered,
      monthlyReviews,
      monthlyCorrect,
      weeklyActivity,
      reviewDates: [...dateSet].sort().reverse(),
    };
  }
}
