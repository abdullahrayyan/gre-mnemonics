import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';

/** Read-side store for achievements + leaderboard (evaluates + persists earned badges). */
export interface GamificationStore {
  listAchievements(userId: string): Promise<AchievementDto[]>;
  leaderboard(userId: string, limit: number): Promise<LeaderboardEntryDto[]>;
}
