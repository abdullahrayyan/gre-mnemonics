import type {
  ReviewCard,
  ReviewOutcome,
  ReviewStore,
  SubmitReviewInput,
} from './review-store.port.js';

const MAX_QUEUE = 100;

/** Build the review queue: due cards first, topped up with new cards. */
export class GetReviewQueueUseCase {
  constructor(private readonly store: ReviewStore) {}

  async execute(
    userId: string,
    options: { limit?: number; includeNew?: boolean } = {},
  ): Promise<ReviewCard[]> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), MAX_QUEUE);
    const due = await this.store.getDueCards(userId, limit);

    if ((options.includeNew ?? true) && due.length < limit) {
      const fresh = await this.store.getNewCards(userId, limit - due.length);
      return [...due, ...fresh];
    }
    return due;
  }
}

/** Apply a review, updating the schedule, progress, review log, and XP. */
export class SubmitReviewUseCase {
  constructor(private readonly store: ReviewStore) {}

  execute(input: SubmitReviewInput): Promise<ReviewOutcome> {
    return this.store.submitReview(input);
  }
}
