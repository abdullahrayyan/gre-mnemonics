import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';
import type { GamificationStore } from './gamification-store.port.js';

export class ListAchievementsUseCase {
  constructor(private readonly store: GamificationStore) {}
  execute(userId: string): Promise<AchievementDto[]> {
    return this.store.listAchievements(userId);
  }
}

export class GetLeaderboardUseCase {
  constructor(private readonly store: GamificationStore) {}
  execute(userId: string, limit = 20): Promise<LeaderboardEntryDto[]> {
    return this.store.leaderboard(userId, Math.min(Math.max(limit, 1), 100));
  }
}
