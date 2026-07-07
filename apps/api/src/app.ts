import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './env.js';
import { apiV1Router } from './router.js';
import { healthRouter } from './modules/health/health.routes.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { httpLogger } from './shared/middleware/http-logger.js';
import { notFoundHandler } from './shared/middleware/not-found.js';
import { requestId } from './shared/middleware/request-id.js';

/**
 * Build the Express application. Pure factory (no network binding) so it can be
 * exercised directly by integration tests with supertest.
 *
 * Middleware order is deliberate:
 *   security → cors → body parsing → correlation id → request logging →
 *   routes → 404 → central error handler.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  // Trust the first proxy hop (Railway/Vercel) so client IPs and protocol are correct.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.API_CORS_ORIGINS.length > 0 ? env.API_CORS_ORIGINS : false,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestId);
  app.use(httpLogger);

  // Unversioned liveness endpoint for platform health checks.
  app.use('/health', healthRouter);
  // Versioned application API.
  app.use('/api/v1', apiV1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
