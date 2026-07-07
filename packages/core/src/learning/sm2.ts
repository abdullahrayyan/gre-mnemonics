import { ReviewRating } from '../words/enums.js';

/** Persistent SM-2 state for one user-word pair. */
export interface Sm2State {
  /** Ease factor (>= 1.3). Higher means longer intervals. */
  easeFactor: number;
  /** Current interval in days. */
  intervalDays: number;
  /** Number of consecutive successful reviews. */
  repetitions: number;
  /** Count of times the card has lapsed (rated Again). */
  lapses: number;
}

export interface Sm2Result extends Sm2State {
  /** When the card is next due. */
  dueDate: Date;
}

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/** Fresh SM-2 state for a card that has never been reviewed. */
export function initialSm2State(): Sm2State {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
  };
}

// Map the 4-button rating to an SM-2 quality grade (0-5).
const RATING_QUALITY: Record<ReviewRating, number> = {
  [ReviewRating.AGAIN]: 2,
  [ReviewRating.HARD]: 3,
  [ReviewRating.GOOD]: 4,
  [ReviewRating.EASY]: 5,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * The complete SM-2 spaced-repetition algorithm.
 *
 * Given the current schedule state and a review rating, returns the next state:
 * an updated ease factor (SM-2 formula, clamped to {@link MIN_EASE_FACTOR}), the
 * next interval, repetition count, lapse count, and the next due date.
 *
 * A rating of Again (quality < 3) lapses the card: repetitions reset, interval
 * back to 1 day, lapses incremented. Hard/Good/Easy all advance the card but
 * adjust the ease factor differently, so later intervals diverge by rating.
 */
export function scheduleSm2(
  state: Sm2State,
  rating: ReviewRating,
  now: Date = new Date(),
): Sm2Result {
  const quality = RATING_QUALITY[rating];

  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  let { intervalDays, repetitions, lapses } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  intervalDays = Math.max(1, intervalDays);
  const dueDate = new Date(now.getTime() + intervalDays * DAY_MS);

  return {
    easeFactor: round2(easeFactor),
    intervalDays,
    repetitions,
    lapses,
    dueDate,
  };
}
