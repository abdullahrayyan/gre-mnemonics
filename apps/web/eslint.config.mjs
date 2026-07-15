import reactConfig from '@mnemonic/eslint-config/react';

export default [
  // Not app source: public/ holds static assets (incl. the service worker, which
  // runs in a service-worker context) and scripts/ holds Node launch tooling —
  // neither matches this browser/React config's globals.
  { ignores: ['.next/**', 'next-env.d.ts', 'public/**', 'scripts/**'] },
  ...reactConfig,
];
