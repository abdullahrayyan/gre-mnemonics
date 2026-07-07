import { ReviewRating, StudySource } from '@mnemonic/core';
import { z } from 'zod';

/** Body schema for submitting a review (`POST /api/v1/reviews`). */
export const submitReviewSchema = z.object({
  wordId: z.string().trim().min(1),
  rating: z.nativeEnum(ReviewRating),
  source: z.nativeEnum(StudySource).optional(),
  responseTimeMs: z.number().int().nonnegative().max(600_000).optional(),
});
export type SubmitReviewDto = z.infer<typeof submitReviewSchema>;

const boolFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

/** Query schema for the review queue. */
export const reviewQueueQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  includeNew: boolFromString.optional(),
});
export type ReviewQueueQueryDto = z.infer<typeof reviewQueueQuerySchema>;
