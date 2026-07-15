import reactConfig from '@mnemonic/eslint-config/react';

export default [
  // Not app source: .next/ and out/ are build output (out/ is the static export
  // that gets deployed), public/ holds static assets (incl. the service worker,
  // which runs in a service-worker context) and scripts/ holds Node launch
  // tooling — none match this browser/React config's globals.
  { ignores: ['.next/**', 'out/**', 'next-env.d.ts', 'public/**', 'scripts/**'] },
  ...reactConfig,
];
