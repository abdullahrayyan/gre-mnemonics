import { Router } from 'express';
import type { Container } from './container/container.js';
import { healthRouter } from './modules/health/health.routes.js';
import { createWordsRouter } from './modules/words/interface/words.routes.js';

/**
 * Versioned API surface (mounted at `/api/v1`). Feature routers register here as
 * they are built (quizzes, tutor, community, …).
 */
export function createApiV1Router(container: Container): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/words', createWordsRouter(container));

  return router;
}
