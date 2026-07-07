import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import base from './base.js';

/** ESLint flat config for React / Next.js (browser globals + rules of hooks). */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Next.js pages/layouts default-export components and config objects.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
