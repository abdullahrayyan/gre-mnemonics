import type { Request, Response } from 'express';
import type {
  GetLeaderboardUseCase,
  ListAchievementsUseCase,
} from '../application/gamification.usecases.js';

export class GamificationController {
  constructor(
    private readonly achievements: ListAchievementsUseCase,
    private readonly leaderboard: GetLeaderboardUseCase,
  ) {}

  listAchievements = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.achievements.execute(req.auth!.userId) });
  };

  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.leaderboard.execute(req.auth!.userId) });
  };
}
