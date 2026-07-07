/**
 * Application error with an HTTP status, a stable machine-readable `code`, and
 * an `isOperational` flag distinguishing expected failures (validation, not
 * found) from bugs. The central error handler renders these into a consistent
 * JSON envelope; unexpected errors become 500s.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      isOperational?: boolean;
      details?: unknown;
      cause?: unknown;
    } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Error.captureStackTrace?.(this, new.target);
  }

  static badRequest(message = 'Bad request', details?: unknown): AppError {
    return new AppError(message, { statusCode: 400, code: 'BAD_REQUEST', details });
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, { statusCode: 403, code: 'FORBIDDEN' });
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, { statusCode: 404, code: 'NOT_FOUND' });
  }

  static conflict(message = 'Conflict', details?: unknown): AppError {
    return new AppError(message, { statusCode: 409, code: 'CONFLICT', details });
  }

  static unprocessable(message = 'Unprocessable entity', details?: unknown): AppError {
    return new AppError(message, { statusCode: 422, code: 'VALIDATION_ERROR', details });
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, { statusCode: 429, code: 'RATE_LIMITED' });
  }

  static internal(message = 'Internal server error', cause?: unknown): AppError {
    return new AppError(message, {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational: false,
      cause,
    });
  }
}
