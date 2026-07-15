import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from 'tailwindcss';

// Resolve content globs relative to THIS file, not the process CWD, so the
// scan works regardless of where `next` is invoked from. Forward slashes are
// required — Tailwind's glob matcher treats backslashes as escapes on Windows.
const here = dirname(fileURLToPath(import.meta.url)).replace(/\\/g, '/');

const config: Config = {
  darkMode: 'class',
  content: [
    `${here}/src/**/*.{ts,tsx}`,
    // Scan the shared design system so its Tailwind classes are included.
    `${here}/../../packages/ui/src/**/*.{ts,tsx}`,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Card slides in from the side you swiped/arrowed from.
        'slide-from-right': {
          from: { opacity: '0', transform: 'translateX(56px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-from-left': {
          from: { opacity: '0', transform: 'translateX(-56px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'slide-from-right': 'slide-from-right 0.22s ease-out both',
        'slide-from-left': 'slide-from-left 0.22s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
