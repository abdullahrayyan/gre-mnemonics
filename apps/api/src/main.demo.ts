import './bootstrap/demo-env.js'; // MUST be first: sets demo env before validation.
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { createDemoContainer } from './container/demo-container.js';
import { env } from './env.js';
import { logger } from './shared/logger.js';

/**
 * Zero-infra demo server. Boots the real Express app with a fully in-memory,
 * pre-seeded container so the whole product can be clicked through without
 * Postgres, Redis, OpenAI, or Clerk. Not for production use.
 */
function start(): Server {
  const container = createDemoContainer();
  const app = createApp({ container });

  const server = app.listen(env.API_PORT, env.API_HOST, () => {
    logger.info(
      { host: env.API_HOST, port: env.API_PORT },
      'Mnemonic API listening in DEMO mode (in-memory, seeded)',
    );
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(() => {
      logger.info('HTTP server closed cleanly');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception; exiting');
    process.exit(1);
  });

  return server;
}

start();
