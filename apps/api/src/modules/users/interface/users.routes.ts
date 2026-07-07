import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { UsersController } from './users.controller.js';

/** `/me` router — the authenticated user's own account + profile. */
export function createUsersRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new UsersController(container.users.getMe, container.users.updateProfile);
  const router = Router();

  router.get('/', auth.requireAuth, asyncHandler(controller.me));
  router.patch('/profile', auth.requireAuth, asyncHandler(controller.patchProfile));

  return router;
}
