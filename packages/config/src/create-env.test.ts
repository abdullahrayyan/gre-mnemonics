import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createEnv, EnvValidationError } from './create-env.js';
import { apiEnvSchema } from './schemas.js';

describe('createEnv', () => {
  it('parses and coerces valid variables', () => {
    const env = createEnv(apiEnvSchema, {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      API_PORT: '8080',
      API_CORS_ORIGINS: 'http://a.com, http://b.com',
    });

    expect(env.NODE_ENV).toBe('production');
    expect(env.API_PORT).toBe(8080);
    expect(env.API_CORS_ORIGINS).toEqual(['http://a.com', 'http://b.com']);
    // Defaults are applied for omitted optional values.
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.API_HOST).toBe('0.0.0.0');
  });

  it('throws EnvValidationError with issue paths when required vars are missing', () => {
    expect(() => createEnv(apiEnvSchema, {})).toThrowError(EnvValidationError);

    try {
      createEnv(apiEnvSchema, {});
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const issue = (error as EnvValidationError).issues.find((i) => i.path[0] === 'DATABASE_URL');
      expect(issue).toBeDefined();
    }
  });

  it('rejects malformed values', () => {
    const schema = z.object({ PORT: z.coerce.number().int().positive() });
    expect(() => createEnv(schema, { PORT: 'not-a-number' })).toThrowError(EnvValidationError);
  });
});
