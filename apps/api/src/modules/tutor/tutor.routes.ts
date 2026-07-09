import { Router } from 'express';
import type { AuthMiddleware } from '../auth/auth.middleware.js';
import type { Container } from '../../container/container.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { createRateLimiter } from '../../shared/middleware/rate-limit.js';
import { TutorController } from './tutor.controller.js';

/** `/tutor` router — streaming AI tutor chat (auth + rate-limited). */
export function createTutorRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new TutorController(container.tutorEngine, container.aiHistoryRecorder);
  const router = Router();

  const limiter = createRateLimiter(
    { points: 30, durationSeconds: 60, keyPrefix: 'tutor' },
    container.redis,
  );

  router.post('/chat', auth.requireAuth, limiter, asyncHandler(controller.chat));

  return router;
}
