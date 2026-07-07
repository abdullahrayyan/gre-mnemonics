import type { Request, Response } from 'express';
import { env } from '../../env.js';

/**
 * Liveness probe. Reports process health without touching downstream
 * dependencies (a readiness probe checking Postgres/Redis is added in Phase 1).
 */
export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'mnemonic-api',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
