import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { createContainer, type Container } from './container/container.js';
import { env } from './env.js';
import { createApiV1Router } from './router.js';
import { createReadinessHandler } from './modules/health/health.readiness.js';
import { healthRouter } from './modules/health/health.routes.js';
import { createWebhooksRouter } from './modules/users/interface/webhooks.routes.js';
import { asyncHandler } from './shared/http/async-handler.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { httpLogger } from './shared/middleware/http-logger.js';
import { notFoundHandler } from './shared/middleware/not-found.js';
import { createRateLimiter } from './shared/middleware/rate-limit.js';
import { requestId } from './shared/middleware/request-id.js';

export interface CreateAppOptions {
  /** Inject a pre-built container (tests supply fakes); defaults to the real graph. */
  container?: Container;
}

/**
 * Build the Express application. Pure factory (no network binding) so tests can
 * drive it with supertest and an injected container.
 */
export function createApp(options: CreateAppOptions = {}): Express {
  const container = options.container ?? createContainer();
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.API_CORS_ORIGINS.length > 0 ? env.API_CORS_ORIGINS : false,
      credentials: true,
    }),
  );
  app.use(requestId);
  app.use(httpLogger);

  // Webhooks verify a signature over the RAW body — mount before the JSON parser.
  app.use('/api/webhooks', createWebhooksRouter(container));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Liveness + readiness probes (unversioned, for platform health checks).
  app.use('/health', healthRouter);
  app.get('/health/ready', asyncHandler(createReadinessHandler(container.prisma)));

  // Versioned API, behind a global per-IP rate limiter.
  const apiLimiter = createRateLimiter(
    { points: 300, durationSeconds: 60, keyPrefix: 'api' },
    container.redis,
  );
  app.use('/api/v1', apiLimiter, createApiV1Router(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
