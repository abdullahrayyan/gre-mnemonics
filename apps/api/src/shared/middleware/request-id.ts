import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Correlation id for the request, echoed in the `x-request-id` header. */
      requestId: string;
    }
  }
}

const MAX_INCOMING_ID_LENGTH = 128;

/**
 * Assigns a correlation id to every request (honoring an inbound `x-request-id`
 * when present and sane) and echoes it back so clients and logs can correlate.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id');
  req.requestId =
    incoming && incoming.length > 0 && incoming.length <= MAX_INCOMING_ID_LENGTH
      ? incoming
      : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
