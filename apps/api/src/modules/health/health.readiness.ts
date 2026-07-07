import type { PrismaClient } from '@mnemonic/database';
import type { Request, Response } from 'express';

/**
 * Readiness probe: verifies the database is reachable. Returns 503 (not 500)
 * when a dependency is down so orchestrators can route traffic away without
 * treating the instance as crashed.
 */
export function createReadinessHandler(prisma: PrismaClient) {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ready', checks: { database: 'up' } });
    } catch {
      res.status(503).json({ status: 'not_ready', checks: { database: 'down' } });
    }
  };
}
