import nodeConfig from '@mnemonic/eslint-config/node';

/**
 * Root ESLint flat config. Packages inherit this by upward resolution and may
 * add their own `eslint.config.js` to extend it (e.g. the Next.js web app).
 */
export default nodeConfig;
