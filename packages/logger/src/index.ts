import { pino, type Logger, type LoggerOptions } from 'pino';

export type { Logger } from 'pino';

/**
 * Paths redacted from every log line to prevent leaking secrets/PII.
 * Uses pino's fast redaction (evaluated at write time).
 */
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'password',
  '*.password',
  'token',
  '*.token',
  'accessToken',
  '*.accessToken',
  'refreshToken',
  '*.refreshToken',
  'apiKey',
  '*.apiKey',
  'secret',
  '*.secret',
  'authorization',
  '*.authorization',
];

export interface CreateLoggerOptions {
  /** Minimum level to emit. Defaults to `LOG_LEVEL` env or `info`. */
  level?: string;
  /** Logical name attached to every line (e.g. `api`, `worker`). */
  name?: string;
  /** Pretty, colorized output. Defaults to true when `NODE_ENV=development`. */
  pretty?: boolean;
}

/**
 * Create a configured Pino logger. JSON in production (ingestible by log
 * platforms), human-friendly pretty output in development.
 */
export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const level = options.level ?? process.env.LOG_LEVEL ?? 'info';
  const pretty = options.pretty ?? process.env.NODE_ENV === 'development';

  const baseOptions: LoggerOptions = {
    level,
    name: options.name,
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (pretty) {
    return pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino(baseOptions);
}

/** Default application logger. Prefer child loggers per module/request. */
export const logger = createLogger({ name: 'mnemonic' });
