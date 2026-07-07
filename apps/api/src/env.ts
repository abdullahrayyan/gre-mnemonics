import { apiEnvSchema, createEnv, type ApiEnv } from '@mnemonic/config';

/**
 * Validated, typed environment for the API. Imported early in the boot graph so
 * misconfiguration fails fast (before the server binds a port).
 */
export const env: ApiEnv = createEnv(apiEnvSchema);

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
