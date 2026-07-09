import { levelFromXp } from '@mnemonic/core';
import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';
import { computeStreak } from '../../stats/application/streak.util.js';
import {
  computeAchievements,
  type BadgeDefinition,
  type ExistingAchievement,
  type LearnerMetrics,
} from '../application/achievement.util.js';
import type { GamificationStore } from '../application/gamification-store.port.js';

const DAY_MS = 86_400_000;

export class PrismaGamificationStore implements GamificationStore {
  constructor(private readonly prisma: PrismaClient) {}

  async listAchievements(userId: string): Promise<AchievementDto[]> {
    const now = new Date();
    const since60 = new Date(now.getTime() - 60 * DAY_MS);
    const mastered = 'MASTERED' as Prisma.LearningProgressUncheckedCreateInput['status'];
    const completed = 'COMPLETED' as Prisma.QuizUncheckedCreateInput['status'];

    const [badges, achievements, wordsLearned, wordsMastered, perfectQuizzes, recentReviews] =
      await this.prisma.$transaction([
        this.prisma.badge.findMany(),
        this.prisma.achievement.findMany({
          where: { userId },
          include: { badge: { select: { key: true } } },
        }),
        this.prisma.learningProgress.count({ where: { userId } }),
        this.prisma.learningProgress.count({ where: { userId, status: mastered } }),
        this.prisma.quiz.count({ where: { userId, status: completed, scorePercent: 100 } }),
        this.prisma.review.findMany({
          where: { userId, reviewedAt: { gte: since60 } },
          select: { reviewedAt: true },
        }),
      ]);

    const dates = [...new Set(recentReviews.map((r) => r.reviewedAt.toISOString().slice(0, 10)))];
    const metrics: LearnerMetrics = {
      wordsLearned,
      wordsMastered,
      perfectQuizzes,
      currentStreak: computeStreak(dates, now),
    };

    const badgeIdByKey = new Map(badges.map((badge) => [badge.key, badge.id]));
    const existing = new Map<string, ExistingAchievement>(
      achievements.map((achievement) => [
        achievement.badge.key,
        { earned: achievement.status === 'EARNED', earnedAt: achievement.earnedAt },
      ]),
    );

    const definitions: BadgeDefinition[] = badges.map((badge) => ({
      key: badge.key,
      name: badge.name,
      description: badge.description,
      tier: badge.tier,
      icon: badge.icon,
      criteria: (badge.criteria as Record<string, unknown>) ?? {},
    }));

    const { views, newlyEarned } = computeAchievements(definitions, metrics, existing, now);

    // Persist milestones (newly earned badges only).
    for (const key of newlyEarned) {
      const badgeId = badgeIdByKey.get(key);
      const view = views.find((v) => v.key === key);
      if (!badgeId || !view) continue;
      await this.prisma.achievement.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: {
          userId,
          badgeId,
          status: 'EARNED',
          progress: view.progress,
          target: view.target,
          earnedAt: now,
        },
        update: { status: 'EARNED', progress: view.progress, target: view.target, earnedAt: now },
      });
    }

    return views;
  }

  async leaderboard(userId: string, limit: number): Promise<LeaderboardEntryDto[]> {
    const rows = await this.prisma.gamificationProfile.findMany({
      orderBy: { totalXp: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, email: true, profile: { select: { displayName: true } } } },
      },
    });

    return rows.map((row, index) => ({
      rank: index + 1,
      name: row.user.profile?.displayName ?? row.user.email.split('@')[0] ?? 'Learner',
      totalXp: row.totalXp,
      level: levelFromXp(row.totalXp),
      isCurrentUser: row.userId === userId,
    }));
  }
}
