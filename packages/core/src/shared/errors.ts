/**
 * Base class for all domain errors. Domain errors are expected, meaningful
 * failures of business rules — distinct from programmer bugs. The interface
 * layer maps them to HTTP responses (see the API's error handler).
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** One or more business-rule/invariant violations. */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly issues: readonly string[];

  constructor(issues: string | string[]) {
    const list = Array.isArray(issues) ? issues : [issues];
    super(list.join('; ') || 'Validation failed');
    this.issues = list;
  }
}

/** A requested aggregate does not exist. */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} not found: ${identifier}` : `${entity} not found`);
  }
}

/** An operation would violate a uniqueness or state constraint. */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}
