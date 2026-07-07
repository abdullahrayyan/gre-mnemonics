import type { z } from 'zod';

/**
 * Thrown when environment variables fail validation. Carries a human-readable,
 * multi-line message so misconfiguration is caught at boot instead of at runtime.
 */
export class EnvValidationError extends Error {
  public readonly issues: z.ZodIssue[];

  constructor(issues: z.ZodIssue[]) {
    const formatted = issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    super(`Invalid environment variables:\n${formatted}`);
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

/**
 * Validate and parse a source of environment variables against a Zod schema.
 * Throws {@link EnvValidationError} (fail-fast) when validation fails.
 *
 * @param schema - Zod object schema describing the required variables.
 * @param source - Raw variables to validate. Defaults to `process.env`.
 */
export function createEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  source: Record<string, string | undefined> = process.env,
): z.infer<TSchema> {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(result.error.issues);
  }

  return result.data;
}
