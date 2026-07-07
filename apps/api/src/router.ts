import { Router } from 'express';
import type { Container } from './container/container.js';
import { createAuthMiddleware } from './modules/auth/auth.middleware.js';
import { healthRouter } from './modules/health/health.routes.js';
import { createReviewsRouter } from './modules/reviews/interface/reviews.routes.js';
import { createUsersRouter } from './modules/users/interface/users.routes.js';
import { createWordsRouter } from './modules/words/interface/words.routes.js';

/**
 * Versioned API surface (mounted at `/api/v1`). Feature routers register here as
 * they are built (quizzes, tutor, community, …).
 */
export function createApiV1Router(container: Container): Router {
  const router = Router();
  const auth = createAuthMiddleware(container);

  router.use('/health', healthRouter);
  router.use('/words', createWordsRouter(container, auth));
  router.use('/me', createUsersRouter(container, auth));
  router.use('/reviews', createReviewsRouter(container, auth));

  return router;
}
