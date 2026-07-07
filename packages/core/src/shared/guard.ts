import { ValidationError } from './errors.js';

/**
 * Fluent invariant collector. Accumulates violations then throws a single
 * {@link ValidationError} so callers see every problem at once instead of one
 * failure at a time. Keeps the domain layer free of external validation deps.
 *
 * @example
 * new Guard()
 *   .requireNonEmpty(word, 'word')
 *   .requireOneOf(difficulty, DIFFICULTIES, 'difficulty')
 *   .throwIfInvalid();
 */
export class Guard {
  private readonly issues: string[] = [];

  requireNonEmpty(value: string | null | undefined, field: string): this {
    if (value === null || value === undefined || value.trim().length === 0) {
      this.issues.push(`${field} must not be empty`);
    }
    return this;
  }

  requireMaxLength(value: string | null | undefined, max: number, field: string): this {
    if (typeof value === 'string' && value.length > max) {
      this.issues.push(`${field} must be at most ${max} characters`);
    }
    return this;
  }

  requireOneOf<T>(value: T, allowed: readonly T[], field: string): this {
    if (!allowed.includes(value)) {
      this.issues.push(`${field} must be one of: ${allowed.join(', ')}`);
    }
    return this;
  }

  /** Allows null/undefined; when present, requires a non-negative integer. */
  requireNonNegativeIntOrNull(value: number | null | undefined, field: string): this {
    if (value === null || value === undefined) return this;
    if (!Number.isInteger(value) || value < 0) {
      this.issues.push(`${field} must be a non-negative integer`);
    }
    return this;
  }

  add(condition: boolean, message: string): this {
    if (condition) this.issues.push(message);
    return this;
  }

  hasErrors(): boolean {
    return this.issues.length > 0;
  }

  throwIfInvalid(): void {
    if (this.issues.length > 0) {
      throw new ValidationError(this.issues);
    }
  }
}
