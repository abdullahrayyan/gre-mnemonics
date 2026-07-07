import { initialSm2State, scheduleSm2 } from '@mnemonic/core';
import { type Prisma, WordMapper, type PrismaClient } from '@mnemonic/database';
import { toWordResponse } from '../../words/application/word.dto.js';
import type {
  ReviewCard,
  ReviewOutcome,
  ReviewStore,
  SubmitReviewInput,
} from '../application/review-store.port.js';
import { computeLearningStatus, XP_BY_RATING } from '../application/review.util.js';

/** Prisma-backed review store. Review submission is a single transaction. */
export class PrismaReviewStore implements ReviewStore {
  constructor(private readonly prisma: PrismaClient) {}

  async getDueCards(userId: string, limit: number): Promise<ReviewCard[]> {
    const rows = await this.prisma.sm2ReviewSchedule.findMany({
      where: { userId, dueAt: { lte: new Date() } },
      include: { word: true },
      orderBy: { dueAt: 'asc' },
      take: limit,
    });
    return rows.map((row) => ({
      word: toWordResponse(WordMapper.toDomain(row.word)),
      dueAt: row.dueAt.toISOString(),
      repetitions: row.repetitions,
      intervalDays: row.intervalDays,
      isNew: false,
    }));
  }

  async getNewCards(userId: string, limit: number): Promise<ReviewCard[]> {
    const rows = await this.prisma.word.findMany({
      where: { status: 'PUBLISHED', reviewSchedules: { none: { userId } } },
      orderBy: [{ frequency: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    });
    return rows.map((word) => ({
      word: toWordResponse(WordMapper.toDomain(word)),
      dueAt: null,
      repetitions: 0,
      intervalDays: 0,
      isNew: true,
    }));
  }

  async submitReview(input: SubmitReviewInput): Promise<ReviewOutcome> {
    const now = new Date();
    const key = { userId_wordId: { userId: input.userId, wordId: input.wordId } };

    const existing = await this.prisma.sm2ReviewSchedule.findUnique({ where: key });
    const previous = existing
      ? {
          easeFactor: existing.easeFactor,
          intervalDays: existing.intervalDays,
          repetitions: existing.repetitions,
          lapses: existing.lapses,
        }
      : initialSm2State();

    const result = scheduleSm2(previous, input.rating, now);
    const status = computeLearningStatus(result.repetitions, result.intervalDays);
    const correct = input.rating !== 'AGAIN';
    const xp = XP_BY_RATING[input.rating];
    const source = input.source ?? 'FLASHCARD';
    const rating = input.rating as Prisma.ReviewUncheckedCreateInput['rating'];
    const isMastered = status === 'MASTERED';

    await this.prisma.$transaction(async (tx) => {
      await tx.sm2ReviewSchedule.upsert({
        where: key,
        create: {
          userId: input.userId,
          wordId: input.wordId,
          easeFactor: result.easeFactor,
          intervalDays: result.intervalDays,
          repetitions: result.repetitions,
          lapses: result.lapses,
          dueAt: result.dueDate,
          lastReviewedAt: now,
          lastRating: rating,
        },
        update: {
          easeFactor: result.easeFactor,
          intervalDays: result.intervalDays,
          repetitions: result.repetitions,
          lapses: result.lapses,
          dueAt: result.dueDate,
          lastReviewedAt: now,
          lastRating: rating,
        },
      });

      await tx.learningProgress.upsert({
        where: key,
        create: {
          userId: input.userId,
          wordId: input.wordId,
          status: status as Prisma.LearningProgressUncheckedCreateInput['status'],
          timesReviewed: 1,
          timesCorrect: correct ? 1 : 0,
          timesIncorrect: correct ? 0 : 1,
          firstSeenAt: now,
          lastReviewedAt: now,
          masteredAt: isMastered ? now : null,
        },
        update: {
          status: status as Prisma.LearningProgressUncheckedCreateInput['status'],
          timesReviewed: { increment: 1 },
          ...(correct ? { timesCorrect: { increment: 1 } } : { timesIncorrect: { increment: 1 } }),
          lastReviewedAt: now,
          ...(isMastered ? { masteredAt: now } : {}),
        },
      });

      await tx.review.create({
        data: {
          userId: input.userId,
          wordId: input.wordId,
          rating,
          previousIntervalDays: previous.intervalDays,
          newIntervalDays: result.intervalDays,
          easeFactorAfter: result.easeFactor,
          responseTimeMs: input.responseTimeMs,
          source: source as Prisma.ReviewUncheckedCreateInput['source'],
          reviewedAt: now,
        },
      });

      await tx.xpEvent.create({
        data: {
          userId: input.userId,
          amount: xp,
          reason: 'REVIEW_COMPLETED' as Prisma.XpEventUncheckedCreateInput['reason'],
          refType: 'word',
          refId: input.wordId,
        },
      });

      await tx.gamificationProfile.updateMany({
        where: { userId: input.userId },
        data: { totalXp: { increment: xp } },
      });
    });

    return {
      wordId: input.wordId,
      status,
      repetitions: result.repetitions,
      intervalDays: result.intervalDays,
      easeFactor: result.easeFactor,
      dueAt: result.dueDate.toISOString(),
      xpAwarded: xp,
    };
  }
}
