/**
 * XP ↔ level math (quadratic curve). Level 1 starts at 0 XP; each level costs
 * more than the last. Shared by the dashboard and the gamification engine.
 */

/** Cumulative XP required to reach a level (1-indexed). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * (level - 1);
}

/** The level for a given total XP. */
export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export interface LevelProgress {
  level: number;
  /** XP earned since the start of the current level. */
  xpIntoLevel: number;
  /** XP needed to span the current level. */
  xpForLevelSpan: number;
  /** Fraction [0,1] of the current level completed. */
  fraction: number;
}

/** Level breakdown for a total XP value. */
export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const currentBase = xpForLevel(level);
  const nextBase = xpForLevel(level + 1);
  const span = nextBase - currentBase;
  const into = Math.max(0, xp - currentBase);
  return {
    level,
    xpIntoLevel: into,
    xpForLevelSpan: span,
    fraction: span > 0 ? Math.min(1, into / span) : 0,
  };
}
