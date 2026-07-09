import type { AchievementDto } from '@mnemonic/types';

export interface LearnerMetrics {
  wordsLearned: number;
  wordsMastered: number;
  perfectQuizzes: number;
  currentStreak: number;
}

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  tier: string;
  icon: string | null;
  criteria: Record<string, unknown>;
}

export interface ExistingAchievement {
  earned: boolean;
  earnedAt: Date | null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

/** Resolve a badge's current value + target from its criteria + the learner's metrics. */
export function evaluateBadge(
  criteria: Record<string, unknown>,
  metrics: LearnerMetrics,
): { value: number; target: number } {
  const streak = asNumber(criteria.streak);
  if (streak !== null) return { value: metrics.currentStreak, target: streak };

  const perfect = asNumber(criteria.perfectQuizzes);
  if (perfect !== null) return { value: metrics.perfectQuizzes, target: perfect };

  const masteredTarget = asNumber(criteria.words);
  if (masteredTarget !== null && criteria.examMastered) {
    return { value: metrics.wordsMastered, target: masteredTarget };
  }

  const learned = asNumber(criteria.wordsLearned);
  if (learned !== null) return { value: metrics.wordsLearned, target: learned };

  return { value: 0, target: 1 };
}

/** Build achievement views + the list of badges newly earned this evaluation. */
export function computeAchievements(
  badges: BadgeDefinition[],
  metrics: LearnerMetrics,
  existing: Map<string, ExistingAchievement>,
  now: Date = new Date(),
): { views: AchievementDto[]; newlyEarned: string[] } {
  const views: AchievementDto[] = [];
  const newlyEarned: string[] = [];

  for (const badge of badges) {
    const { value, target } = evaluateBadge(badge.criteria, metrics);
    const prior = existing.get(badge.key);
    const wasEarned = prior?.earned ?? false;
    const isEarned = wasEarned || value >= target;

    if (isEarned && !wasEarned) newlyEarned.push(badge.key);

    let earnedAt: string | null = null;
    if (prior?.earnedAt) earnedAt = prior.earnedAt.toISOString();
    else if (isEarned && !wasEarned) earnedAt = now.toISOString();

    views.push({
      key: badge.key,
      name: badge.name,
      description: badge.description,
      tier: badge.tier,
      icon: badge.icon,
      status: isEarned ? 'EARNED' : 'IN_PROGRESS',
      progress: Math.min(value, target),
      target,
      earnedAt,
    });
  }

  return { views, newlyEarned };
}
