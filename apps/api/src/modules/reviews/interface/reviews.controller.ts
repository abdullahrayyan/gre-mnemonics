import { reviewQueueQuerySchema, submitReviewSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type { GetReviewQueueUseCase, SubmitReviewUseCase } from '../application/review.usecases.js';

export class ReviewsController {
  constructor(
    private readonly queue: GetReviewQueueUseCase,
    private readonly submit: SubmitReviewUseCase,
  ) {}

  getQueue = async (req: Request, res: Response): Promise<void> => {
    const query = reviewQueueQuerySchema.parse(req.query);
    const cards = await this.queue.execute(req.auth!.userId, {
      limit: query.limit,
      includeNew: query.includeNew,
    });
    res.status(200).json({ data: cards });
  };

  submitReview = async (req: Request, res: Response): Promise<void> => {
    const body = submitReviewSchema.parse(req.body);
    const outcome = await this.submit.execute({
      userId: req.auth!.userId,
      wordId: body.wordId,
      rating: body.rating,
      source: body.source,
      responseTimeMs: body.responseTimeMs,
    });
    res.status(201).json({ data: outcome });
  };
}
