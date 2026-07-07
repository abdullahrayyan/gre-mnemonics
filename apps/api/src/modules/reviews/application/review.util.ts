import { LearningStatus, type ReviewRating } from '@mnemonic/core';

/** XP awarded per review rating. */
export const XP_BY_RATING: Record<ReviewRating, number> = {
  AGAIN: 2,
  HARD: 5,
  GOOD: 8,
  EASY: 10,
};

/** Derive the learner's mastery status from the resulting SM-2 state. */
export function computeLearningStatus(repetitions: number, intervalDays: number): LearningStatus {
  if (repetitions === 0) return LearningStatus.LEARNING;
  if (repetitions >= 3 && intervalDays >= 21) return LearningStatus.MASTERED;
  return LearningStatus.REVIEW;
}
