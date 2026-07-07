import { ConflictError, DomainError, NotFoundError, ValidationError } from '@mnemonic/core';
import type { ErrorRequestHandler, Request } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../http/http-error.js';
import { logger } from '../logger.js';
import { isProduction } from '../../env.js';

/** Map a domain error to its HTTP status. */
function statusForDomainError(error: DomainError): number {
  if (error instanceof ValidationError) return 422;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  return 400;
}

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

function requestLogger(req: Request) {
  return (req as Request & { log?: typeof logger }).log ?? logger;
}

/**
 * Central error handler. Produces a consistent JSON envelope for every failure:
 *   - ZodError            → 422 VALIDATION_ERROR (with flattened field errors)
 *   - AppError            → its status/code (operational errors logged at warn)
 *   - anything else       → 500 INTERNAL_ERROR (message hidden in production)
 *
 * Must be registered last, after all routers and the 404 handler.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const log = requestLogger(req);

  if (err instanceof ZodError) {
    const envelope: ErrorEnvelope = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        requestId: req.requestId,
        details: err.flatten(),
      },
    };
    res.status(422).json(envelope);
    return;
  }

  if (err instanceof DomainError) {
    const status = statusForDomainError(err);
    if (status >= 500) log.error({ err, code: err.code }, err.message);
    const envelope: ErrorEnvelope = {
      error: {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
        details: err instanceof ValidationError ? { issues: err.issues } : undefined,
      },
    };
    res.status(status).json(envelope);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      log.error({ err, code: err.code }, err.message);
    } else {
      log.warn({ code: err.code, statusCode: err.statusCode }, err.message);
    }

    const envelope: ErrorEnvelope = {
      error: {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(envelope);
    return;
  }

  log.error({ err }, 'Unhandled error');

  const message = isProduction || !(err instanceof Error) ? 'Internal server error' : err.message;

  const envelope: ErrorEnvelope = {
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId: req.requestId,
    },
  };
  res.status(500).json(envelope);
};
