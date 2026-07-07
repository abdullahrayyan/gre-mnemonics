import { initialSm2State, scheduleSm2, type Sm2State } from '@mnemonic/core';
import type { WordResponse } from '../../words/application/word.dto.js';
import type {
  ReviewCard,
  ReviewOutcome,
  ReviewStore,
  SubmitReviewInput,
} from '../application/review-store.port.js';
import { computeLearningStatus, XP_BY_RATING } from '../application/review.util.js';

interface ScheduleEntry {
  state: Sm2State;
  dueAt: Date;
}

/** In-memory review store for tests. Seeded with a fixed set of words. */
export class InMemoryReviewStore implements ReviewStore {
  private readonly schedules = new Map<string, ScheduleEntry>();
  private readonly xpByUser = new Map<string, number>();

  constructor(private readonly words: WordResponse[]) {}

  private key(userId: string, wordId: string): string {
    return `${userId}:${wordId}`;
  }

  async getDueCards(userId: string, limit: number): Promise<ReviewCard[]> {
    const now = Date.now();
    const cards: ReviewCard[] = [];
    for (const word of this.words) {
      const entry = this.schedules.get(this.key(userId, word.id));
      if (entry && entry.dueAt.getTime() <= now) {
        cards.push({
          word,
          dueAt: entry.dueAt.toISOString(),
          repetitions: entry.state.repetitions,
          intervalDays: entry.state.intervalDays,
          isNew: false,
        });
      }
    }
    return cards.slice(0, limit);
  }

  async getNewCards(userId: string, limit: number): Promise<ReviewCard[]> {
    return this.words
      .filter((word) => !this.schedules.has(this.key(userId, word.id)))
      .slice(0, limit)
      .map((word) => ({ word, dueAt: null, repetitions: 0, intervalDays: 0, isNew: true }));
  }

  async submitReview(input: SubmitReviewInput): Promise<ReviewOutcome> {
    const previous =
      this.schedules.get(this.key(input.userId, input.wordId))?.state ?? initialSm2State();
    const result = scheduleSm2(previous, input.rating);
    this.schedules.set(this.key(input.userId, input.wordId), {
      state: result,
      dueAt: result.dueDate,
    });

    const xp = XP_BY_RATING[input.rating];
    this.xpByUser.set(input.userId, (this.xpByUser.get(input.userId) ?? 0) + xp);

    return {
      wordId: input.wordId,
      status: computeLearningStatus(result.repetitions, result.intervalDays),
      repetitions: result.repetitions,
      intervalDays: result.intervalDays,
      easeFactor: result.easeFactor,
      dueAt: result.dueDate.toISOString(),
      xpAwarded: xp,
    };
  }

  totalXp(userId: string): number {
    return this.xpByUser.get(userId) ?? 0;
  }
}
