import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { StatsController } from './stats.controller.js';

/** `/stats` router — aggregated learner analytics. */
export function createStatsRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new StatsController(container.stats.getDashboard);
  const router = Router();

  router.get('/dashboard', auth.requireAuth, asyncHandler(controller.dashboard));

  return router;
}
