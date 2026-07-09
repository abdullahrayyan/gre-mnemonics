import { Router } from 'express';
import type { Container } from './container/container.js';
import { createAuthMiddleware } from './modules/auth/auth.middleware.js';
import { healthRouter } from './modules/health/health.routes.js';
import { createAdminRouter } from './modules/admin/interface/admin.routes.js';
import { createAnalyticsRouter } from './modules/analytics/analytics.routes.js';
import { createBillingRouter } from './modules/billing/interface/billing.routes.js';
import { createCommunityRouter } from './modules/community/interface/community.routes.js';
import { createGamificationRouter } from './modules/gamification/interface/gamification.routes.js';
import { createQuizzesRouter } from './modules/quizzes/interface/quizzes.routes.js';
import { createReviewsRouter } from './modules/reviews/interface/reviews.routes.js';
import { createStatsRouter } from './modules/stats/interface/stats.routes.js';
import { createTutorRouter } from './modules/tutor/tutor.routes.js';
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
  router.use('/quizzes', createQuizzesRouter(container, auth));
  router.use('/tutor', createTutorRouter(container, auth));
  router.use('/gamification', createGamificationRouter(container, auth));
  router.use('/community', createCommunityRouter(container, auth));
  router.use('/admin', createAdminRouter(container, auth));
  router.use('/billing', createBillingRouter(container, auth));
  router.use('/stats', createStatsRouter(container, auth));
  router.use('/analytics', createAnalyticsRouter(container, auth));

  return router;
}
