import { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import { CommunityController } from './community.controller.js';

/** `/community` router — submitted mnemonics, votes, comments, reports. */
export function createCommunityRouter(container: Container, auth: AuthMiddleware): Router {
  const c = container.community;
  const controller = new CommunityController(
    c.list,
    c.submit,
    c.vote,
    c.listComments,
    c.addComment,
    c.report,
  );
  const router = Router();

  router.get('/mnemonics', auth.optionalAuth, asyncHandler(controller.list));
  router.post('/mnemonics', auth.requireAuth, asyncHandler(controller.submit));
  router.post('/mnemonics/:id/vote', auth.requireAuth, asyncHandler(controller.vote));
  router.get('/mnemonics/:id/comments', auth.optionalAuth, asyncHandler(controller.comments));
  router.post('/mnemonics/:id/comments', auth.requireAuth, asyncHandler(controller.addCommentHandler));
  router.post('/reports', auth.requireAuth, asyncHandler(controller.report));

  return router;
}
