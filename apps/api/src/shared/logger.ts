import { createLogger, type Logger } from '@mnemonic/logger';
import { env } from '../env.js';

/** Application-wide logger for the API service. Prefer `req.log` inside requests. */
export const logger: Logger = createLogger({
  name: 'api',
  level: env.LOG_LEVEL,
  pretty: env.NODE_ENV === 'development',
});
