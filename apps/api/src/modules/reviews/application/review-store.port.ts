import type { LearningStatus, ReviewRating, StudySource } from '@mnemonic/core';
import type { WordResponse } from '../../words/application/word.dto.js';

/** A card in the review queue — a word plus its (optional) schedule state. */
export interface ReviewCard {
  word: WordResponse;
  dueAt: string | null;
  repetitions: number;
  intervalDays: number;
  isNew: boolean;
}

export interface SubmitReviewInput {
  userId: string;
  wordId: string;
  rating: ReviewRating;
  source?: StudySource;
  responseTimeMs?: number;
}

export interface ReviewOutcome {
  wordId: string;
  status: LearningStatus;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  xpAwarded: number;
}

/**
 * Port for the review flow: reading the due/new queue and atomically applying a
 * review (SM-2 schedule + learning progress + review log + XP).
 */
export interface ReviewStore {
  getDueCards(userId: string, limit: number): Promise<ReviewCard[]>;
  getNewCards(userId: string, limit: number): Promise<ReviewCard[]>;
  submitReview(input: SubmitReviewInput): Promise<ReviewOutcome>;
}
