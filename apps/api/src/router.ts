import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';

/**
 * Versioned API surface (mounted at `/api/v1`). Feature routers register here as
 * they are built (words, quizzes, tutor, community, …).
 */
export const apiV1Router: Router = Router();

apiV1Router.use('/health', healthRouter);
