// Launches the in-memory demo API (src/main.demo.ts) via tsx, with apps/api as
// its cwd so tsx and all workspace deps resolve regardless of the launcher's
// working directory. All demo env defaults are set inside main.demo.ts.
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const child = spawn(process.execPath, ['--import', 'tsx', 'src/main.demo.ts'], {
  cwd: apiDir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
