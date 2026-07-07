import { describe, expect, it } from 'vitest';
import { ReviewRating } from '../words/enums.js';
import { DEFAULT_EASE_FACTOR, initialSm2State, MIN_EASE_FACTOR, scheduleSm2 } from './sm2.js';

const now = new Date('2026-01-01T00:00:00.000Z');
const daysFrom = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

describe('scheduleSm2', () => {
  it('schedules a new card rated Good to 1 day, repetition 1', () => {
    const result = scheduleSm2(initialSm2State(), ReviewRating.GOOD, now);
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.dueDate).toEqual(daysFrom(now, 1));
  });

  it('advances the second success to 6 days', () => {
    const first = scheduleSm2(initialSm2State(), ReviewRating.GOOD, now);
    const second = scheduleSm2(first, ReviewRating.GOOD, now);
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it('uses interval * easeFactor from the third success', () => {
    let state = scheduleSm2(initialSm2State(), ReviewRating.GOOD, now);
    state = scheduleSm2(state, ReviewRating.GOOD, now); // interval 6
    const third = scheduleSm2(state, ReviewRating.GOOD, now);
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(Math.round(6 * third.easeFactor));
    expect(third.intervalDays).toBeGreaterThan(6);
  });

  it('lapses on Again: resets repetitions, interval to 1, increments lapses', () => {
    let state = scheduleSm2(initialSm2State(), ReviewRating.GOOD, now);
    state = scheduleSm2(state, ReviewRating.GOOD, now);
    const lapsed = scheduleSm2(state, ReviewRating.AGAIN, now);
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.lapses).toBe(1);
  });

  it('never lets the ease factor drop below the minimum', () => {
    let state = initialSm2State();
    for (let i = 0; i < 12; i += 1) {
      state = scheduleSm2(state, ReviewRating.AGAIN, now);
    }
    expect(state.easeFactor).toBe(MIN_EASE_FACTOR);
  });

  it('raises ease on Easy and lowers it on Hard relative to Good', () => {
    const base = initialSm2State();
    const easy = scheduleSm2(base, ReviewRating.EASY, now);
    const good = scheduleSm2(base, ReviewRating.GOOD, now);
    const hard = scheduleSm2(base, ReviewRating.HARD, now);
    expect(easy.easeFactor).toBeGreaterThan(good.easeFactor);
    expect(hard.easeFactor).toBeLessThan(good.easeFactor);
    expect(good.easeFactor).toBeCloseTo(DEFAULT_EASE_FACTOR, 5);
  });

  it('diverges later intervals by rating via the ease factor', () => {
    const seed = () => {
      let s = scheduleSm2(initialSm2State(), ReviewRating.GOOD, now);
      s = scheduleSm2(s, ReviewRating.GOOD, now); // interval 6, reps 2
      return s;
    };
    const easy = scheduleSm2(seed(), ReviewRating.EASY, now);
    const hard = scheduleSm2(seed(), ReviewRating.HARD, now);
    expect(easy.intervalDays).toBeGreaterThan(hard.intervalDays);
  });
});
