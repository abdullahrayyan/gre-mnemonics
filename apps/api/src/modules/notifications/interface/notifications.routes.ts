import { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import { NotificationsController } from './notifications.controller.js';

/** `/notifications` router — in-app inbox (auth). */
export function createNotificationsRouter(container: Container, auth: AuthMiddleware): Router {
  const n = container.notifications;
  const controller = new NotificationsController(n.list, n.unreadCount, n.markRead, n.markAll);
  const router = Router();

  router.get('/', auth.requireAuth, asyncHandler(controller.list));
  router.get('/unread-count', auth.requireAuth, asyncHandler(controller.unreadCount));
  router.post('/read-all', auth.requireAuth, asyncHandler(controller.markAll));
  router.post('/:id/read', auth.requireAuth, asyncHandler(controller.markRead));

  return router;
}
