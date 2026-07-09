import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { GamificationController } from './gamification.controller.js';

/** `/gamification` router — achievements + leaderboard. */
export function createGamificationRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new GamificationController(
    container.gamification.listAchievements,
    container.gamification.getLeaderboard,
  );
  const router = Router();

  router.get('/achievements', auth.requireAuth, asyncHandler(controller.listAchievements));
  router.get('/leaderboard', auth.requireAuth, asyncHandler(controller.getLeaderboard));

  return router;
}
