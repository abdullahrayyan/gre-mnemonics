import { pinoHttp } from 'pino-http';
import { logger } from '../logger.js';

/**
 * Per-request structured logging. Reuses the correlation id set by the
 * `requestId` middleware and attaches a child logger at `req.log`. Health-check
 * noise is suppressed to keep logs signal-rich.
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as { requestId?: string }).requestId ?? 'unknown',
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/api/v1/health',
  },
});
