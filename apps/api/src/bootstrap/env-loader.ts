import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

/**
 * Side-effecting module: loads `.env` files into `process.env` BEFORE any module
 * that reads env (e.g. `./env.ts`) is evaluated. Import this first in `main.ts`.
 *
 * Precedence (first found wins, never overrides an already-set variable):
 *   1. apps/api/.env        (service-local overrides)
 *   2. <repo-root>/.env     (shared defaults)
 *
 * In production the platform injects env directly, so no file is found — safe.
 */
const here = dirname(fileURLToPath(import.meta.url));

const candidates = [
  resolve(here, '../../.env'), // apps/api/.env
  resolve(here, '../../../../.env'), // <repo-root>/.env
];

for (const path of candidates) {
  if (existsSync(path)) {
    loadDotenv({ path, override: false });
  }
}
