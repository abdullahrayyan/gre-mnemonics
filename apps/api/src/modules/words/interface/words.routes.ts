import { UserRole } from '@mnemonic/core';
import { Router } from 'express';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRateLimiter } from '../../../shared/middleware/rate-limit.js';
import { WordsController } from './words.controller.js';

/**
 * Build the `/words` router. Reads are public; writes and AI generation require
 * an ADMIN role (content management).
 */
export function createWordsRouter(container: Container, auth: AuthMiddleware): Router {
  const controller = new WordsController(container.words);
  const router = Router();
  const admin = auth.requireRole(UserRole.ADMIN);

  const generateLimiter = createRateLimiter(
    { points: 20, durationSeconds: 60, keyPrefix: 'words:generate' },
    container.redis,
  );

  router.get('/', asyncHandler(controller.list));
  router.post('/', admin, asyncHandler(controller.create));
  router.get('/slug/:slug', asyncHandler(controller.getBySlug));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', admin, asyncHandler(controller.update));
  router.delete('/:id', admin, asyncHandler(controller.remove));
  router.post('/:id/generate', admin, generateLimiter, asyncHandler(controller.generate));

  return router;
}
