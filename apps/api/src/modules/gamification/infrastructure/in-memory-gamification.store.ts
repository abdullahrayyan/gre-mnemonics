import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';
import type { GamificationStore } from '../application/gamification-store.port.js';

/** In-memory gamification store for tests — returns fixed data. */
export class InMemoryGamificationStore implements GamificationStore {
  constructor(
    private readonly achievements: AchievementDto[],
    private readonly board: LeaderboardEntryDto[],
  ) {}

  async listAchievements(): Promise<AchievementDto[]> {
    return this.achievements;
  }

  async leaderboard(): Promise<LeaderboardEntryDto[]> {
    return this.board;
  }
}
