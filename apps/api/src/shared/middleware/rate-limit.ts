import type { NextFunction, Request, Response } from 'express';
import type { Redis } from 'ioredis';
import {
  RateLimiterMemory,
  RateLimiterRedis,
  type RateLimiterAbstract,
} from 'rate-limiter-flexible';
import { AppError } from '../http/http-error.js';

export interface RateLimitOptions {
  points: number;
  durationSeconds: number;
  keyPrefix: string;
}

/**
 * Build a rate-limit middleware. Uses Redis when available (shared across API
 * instances) with an in-memory insurance limiter as fallback; otherwise a pure
 * in-memory limiter. Keys on client IP; responds 429 with `Retry-After`.
 */
export function createRateLimiter(options: RateLimitOptions, redis: Redis | null) {
  const memory = new RateLimiterMemory({
    points: options.points,
    duration: options.durationSeconds,
    keyPrefix: `${options.keyPrefix}:mem`,
  });

  const limiter: RateLimiterAbstract = redis
    ? new RateLimiterRedis({
        storeClient: redis,
        points: options.points,
        duration: options.durationSeconds,
        keyPrefix: options.keyPrefix,
        insuranceLimiter: memory,
      })
    : memory;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.ip ?? 'unknown';
    try {
      const result = await limiter.consume(key);
      res.setHeader('X-RateLimit-Limit', options.points);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      next();
    } catch (rejection) {
      if (rejection instanceof Error) {
        // Unexpected limiter error — fail open rather than block traffic.
        next();
        return;
      }
      const msBeforeNext = (rejection as { msBeforeNext?: number }).msBeforeNext ?? 1000;
      res.setHeader('Retry-After', Math.ceil(msBeforeNext / 1000));
      next(AppError.tooManyRequests());
    }
  };
}
