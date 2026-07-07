import { Redis } from 'ioredis';
import { env } from '../env.js';
import { logger } from '../shared/logger.js';

let client: Redis | null = null;

/**
 * Lazily create the shared Redis client, or return `null` when `REDIS_URL` is
 * not configured (the app then uses in-memory cache + rate limiting). Connection
 * errors are logged, not thrown, so a Redis outage degrades gracefully.
 */
export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (client) return client;

  client = new Redis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
  });

  client.on('error', (err) => logger.warn({ err }, 'Redis connection error'));
  client.on('connect', () => logger.info('Redis connected'));

  return client;
}

/** Close the Redis connection (used on graceful shutdown). */
export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => undefined);
    client = null;
  }
}
