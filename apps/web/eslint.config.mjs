import reactConfig from '@mnemonic/eslint-config/react';

export default [
  { ignores: ['.next/**', 'next-env.d.ts'] },
  ...reactConfig,
];
