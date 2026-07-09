import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { QuizzesController } from './quizzes.controller.js';

/** `/quizzes` router — start a quiz, answer questions, review weak words. */
export function createQuizzesRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new QuizzesController(
    container.quizzes.start,
    container.quizzes.answer,
    container.quizzes.weakWords,
  );
  const router = Router();

  router.post('/', auth.requireAuth, asyncHandler(controller.start));
  router.get('/weak-words', auth.requireAuth, asyncHandler(controller.weak));
  router.post('/:id/answers', auth.requireAuth, asyncHandler(controller.answer));

  return router;
}
