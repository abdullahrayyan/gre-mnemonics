import { z } from 'zod';

/**
 * Composable environment-variable schemas. Each feature module validates only
 * the slice it needs, keeping the boot contract explicit and minimal.
 */

export const nodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');

export const logLevelSchema = z
  .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  .default('info');

/** Variables shared by every runtime (API, workers, CLIs). */
export const runtimeEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  LOG_LEVEL: logLevelSchema,
});

/** Comma-separated list → trimmed, non-empty string array. */
const csvToArray = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

/** HTTP server configuration for the Express API. */
export const httpServerEnvSchema = z.object({
  API_PORT: z.coerce.number().int().positive().max(65535).default(4000),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  API_CORS_ORIGINS: csvToArray,
});

/** PostgreSQL connection strings (pooled runtime + direct for migrations). */
export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

/** Redis connection for rate limiting, caching, and queues. */
export const redisEnvSchema = z.object({
  REDIS_URL: z.string().url().optional(),
});

/**
 * The complete environment contract required for the API to boot.
 * Feature-specific secrets (OpenAI, Stripe, Clerk, …) are validated lazily by
 * their own modules so the core service can start without every integration.
 */
export const apiEnvSchema = runtimeEnvSchema
  .merge(httpServerEnvSchema)
  .merge(databaseEnvSchema)
  .merge(redisEnvSchema);

/**
 * OpenAI configuration. Validated lazily by the AI module when it initializes,
 * so the core API can boot without an AI key configured.
 */
export const openaiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  OPENAI_MODEL_FALLBACK: z.string().min(1).default('gpt-4o-mini'),
  OPENAI_IMAGE_MODEL: z.string().min(1).default('gpt-image-1'),
  OPENAI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
});

/** Clerk authentication configuration (validated lazily by the auth module). */
export const clerkEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type NodeEnv = z.infer<typeof nodeEnvSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type OpenAiEnv = z.infer<typeof openaiEnvSchema>;
export type ClerkEnv = z.infer<typeof clerkEnvSchema>;
