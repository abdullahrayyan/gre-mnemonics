import { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRateLimiter } from '../../../shared/middleware/rate-limit.js';
import { WordsController } from './words.controller.js';

/** Build the `/words` router wired to the container's use-cases. */
export function createWordsRouter(container: Container): Router {
  const controller = new WordsController(container.words);
  const router = Router();

  // AI generation is expensive — apply a stricter per-IP limit.
  const generateLimiter = createRateLimiter(
    { points: 20, durationSeconds: 60, keyPrefix: 'words:generate' },
    container.redis,
  );

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/slug/:slug', asyncHandler(controller.getBySlug));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));
  router.post('/:id/generate', generateLimiter, asyncHandler(controller.generate));

  return router;
}
