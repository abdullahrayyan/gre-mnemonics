import type { Request, Response } from 'express';
import type { GetDashboardUseCase } from '../application/get-dashboard.usecase.js';

export class StatsController {
  constructor(private readonly getDashboard: GetDashboardUseCase) {}

  dashboard = async (req: Request, res: Response): Promise<void> => {
    const data = await this.getDashboard.execute(req.auth!.userId);
    res.status(200).json({ data });
  };
}
