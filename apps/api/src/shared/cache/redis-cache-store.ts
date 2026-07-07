import type { Redis } from 'ioredis';
import { logger } from '../logger.js';
import type { CacheStore } from './cache-store.js';

/**
 * Redis-backed cache. All operations are defensive: if Redis is unreachable the
 * cache degrades to a no-op (miss) rather than propagating the error, so a Redis
 * outage never takes down request handling.
 */
export class RedisCacheStore implements CacheStore {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (err) {
      logger.warn({ err, key }, 'Redis GET failed; treating as cache miss');
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, value);
      }
    } catch (err) {
      logger.warn({ err, key }, 'Redis SET failed; skipping cache write');
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      logger.warn({ err, key }, 'Redis DEL failed');
    }
  }
}
