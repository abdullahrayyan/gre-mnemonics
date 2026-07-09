import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pin Tailwind to THIS app's config by absolute path. Without it, Tailwind
// auto-detects `tailwind.config.*` starting from process.cwd(); when the dev
// server is launched from the monorepo root (e.g. `next dev apps/web`), that
// search misses apps/web/tailwind.config.ts and silently falls back to the
// default empty `content`, emitting preflight but no utility classes.
const here = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: join(here, 'tailwind.config.ts') },
    autoprefixer: {},
  },
};
