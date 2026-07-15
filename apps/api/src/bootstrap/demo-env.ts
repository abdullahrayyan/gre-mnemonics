/**
 * Side-effecting module: populates process.env with safe defaults for the
 * zero-infra demo BEFORE any module that reads env (`./env.ts`) is evaluated.
 * Import this FIRST in `main.demo.ts`.
 *
 * Nothing here connects to real infrastructure — DATABASE_URL is a syntactically
 * valid placeholder that is never queried (the demo container is fully
 * in-memory), and CORS is opened to the local web dev server plus this machine's
 * LAN address so the demo is reachable from a phone on the same Wi-Fi.
 */
import { networkInterfaces } from 'node:os';

function setDefault(key: string, value: string): void {
  if (!process.env[key]) process.env[key] = value;
}

/** All non-internal IPv4 addresses of this machine (for CORS + phone access). */
function lanAddresses(): string[] {
  const found: string[] = [];
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.')) {
        found.push(address.address);
      }
    }
  }
  return found;
}

const origins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
for (const ip of lanAddresses()) origins.push(`http://${ip}:3000`);

setDefault('NODE_ENV', 'development');
setDefault('DEMO_MODE', '1');
setDefault('LOG_LEVEL', 'info');
setDefault('DATABASE_URL', 'postgresql://demo:demo@localhost:5432/demo?schema=public');
setDefault('API_PORT', '4000');
setDefault('API_HOST', '0.0.0.0');
setDefault('API_CORS_ORIGINS', origins.join(','));
