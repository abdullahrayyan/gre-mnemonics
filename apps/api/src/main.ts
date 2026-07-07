import './bootstrap/env-loader.js'; // MUST be first: populates process.env before env validation.
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { closeRedis } from './config/redis.js';
import { createContainer } from './container/container.js';
import { env } from './env.js';
import { logger } from './shared/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

function start(): Server {
  const container = createContainer();
  const app = createApp({ container });

  const server = app.listen(env.API_PORT, env.API_HOST, () => {
    logger.info(
      { host: env.API_HOST, port: env.API_PORT, env: env.NODE_ENV },
      'Mnemonic API listening',
    );
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, 'Error during graceful shutdown');
        process.exit(1);
      }
      await container.prisma.$disconnect().catch(() => undefined);
      await closeRedis();
      logger.info('HTTP server closed cleanly');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception; exiting');
    process.exit(1);
  });

  return server;
}

start();
