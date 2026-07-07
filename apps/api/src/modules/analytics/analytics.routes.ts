import { Router } from 'express';
import type { AuthMiddleware } from '../auth/auth.middleware.js';
import type { Container } from '../../container/container.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { AnalyticsController } from './analytics.controller.js';

/** `/analytics` router — client event tracking (auth optional). */
export function createAnalyticsRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new AnalyticsController(container.analyticsRecorder);
  const router = Router();

  router.post('/', auth.optionalAuth, asyncHandler(controller.track));

  return router;
}
