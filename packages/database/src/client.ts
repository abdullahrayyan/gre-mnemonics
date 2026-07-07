import { PrismaClient } from '@prisma/client';

export type { PrismaClient } from '@prisma/client';

type LogLevel = 'query' | 'info' | 'warn' | 'error';

export interface CreatePrismaClientOptions {
  /** Override the datasource URL (e.g. per-test database). */
  datasourceUrl?: string;
  /** Prisma log levels. Defaults to warn+error (plus query in development). */
  log?: LogLevel[];
}

function defaultLogLevels(): LogLevel[] {
  return process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];
}

/** Construct a fresh PrismaClient. Prefer the shared {@link prisma} singleton. */
export function createPrismaClient(options: CreatePrismaClientOptions = {}): PrismaClient {
  return new PrismaClient({
    log: options.log ?? defaultLogLevels(),
    ...(options.datasourceUrl ? { datasourceUrl: options.datasourceUrl } : {}),
  });
}

// Reuse a single client across hot-reloads in development to avoid exhausting
// the Postgres connection pool. In production a single instance is created.
const globalForPrisma = globalThis as unknown as { __mnemonicPrisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.__mnemonicPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__mnemonicPrisma = prisma;
}
