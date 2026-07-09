/**
 * Side-effecting module: populates process.env with safe defaults for the
 * zero-infra demo BEFORE any module that reads env (`./env.ts`) is evaluated.
 * Import this FIRST in `main.demo.ts`.
 *
 * Nothing here connects to real infrastructure — DATABASE_URL is a syntactically
 * valid placeholder that is never queried (the demo container is fully
 * in-memory), and CORS is opened to the local web dev server.
 */
function setDefault(key: string, value: string): void {
  if (!process.env[key]) process.env[key] = value;
}

setDefault('NODE_ENV', 'development');
setDefault('DEMO_MODE', '1');
setDefault('LOG_LEVEL', 'info');
setDefault('DATABASE_URL', 'postgresql://demo:demo@localhost:5432/demo?schema=public');
setDefault('API_PORT', '4000');
setDefault('API_HOST', '0.0.0.0');
setDefault('API_CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000');
