import { defineConfig } from 'tsup';

/**
 * Production build. Workspace packages (`@mnemonic/*`) are bundled from source
 * via `noExternal`; third-party node_modules stay external and are installed at
 * runtime. Output is a single ESM entrypoint runnable with `node dist/main.js`.
 */
export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  skipNodeModulesBundle: true,
  noExternal: [/^@mnemonic\//],
});
