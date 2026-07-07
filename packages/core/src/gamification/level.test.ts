import { describe, expect, it } from 'vitest';
import { levelFromXp, levelProgress, xpForLevel } from './level.js';

describe('level math', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(xpForLevel(1)).toBe(0);
  });

  it('crosses level thresholds at the quadratic curve', () => {
    expect(xpForLevel(2)).toBe(50);
    expect(xpForLevel(3)).toBe(200);
    expect(levelFromXp(49)).toBe(1);
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(200)).toBe(3);
  });

  it('reports progress within a level', () => {
    const progress = levelProgress(75);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(25);
    expect(progress.xpForLevelSpan).toBe(150);
    expect(progress.fraction).toBeCloseTo(25 / 150, 5);
  });
});
