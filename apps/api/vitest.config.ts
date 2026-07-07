import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Env required for `@mnemonic/config` to validate at import time under test.
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/mnemonic_test',
      API_CORS_ORIGINS: 'http://localhost:3000',
    },
  },
});
