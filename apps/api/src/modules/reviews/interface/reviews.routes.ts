import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { ReviewsController } from './reviews.controller.js';

/** `/reviews` router — the authenticated learner's spaced-repetition flow. */
export function createReviewsRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new ReviewsController(container.reviews.getQueue, container.reviews.submit);
  const router = Router();

  router.get('/queue', auth.requireAuth, asyncHandler(controller.getQueue));
  router.post('/', auth.requireAuth, asyncHandler(controller.submitReview));

  return router;
}
