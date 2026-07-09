// Launches `next dev` in DEMO mode: sets the public demo flag (which the auth
// shim + middleware read) before Next compiles, then spawns Next with apps/web
// as its cwd so config resolution works regardless of where this is invoked.
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

process.env.NEXT_PUBLIC_DEMO_MODE = '1';
process.env.NEXT_PUBLIC_API_BASE_URL ??= 'http://localhost:4000';

const nextBin = resolve(webDir, 'node_modules/next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-p', '3000'], {
  cwd: webDir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
