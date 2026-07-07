/**
 * @mnemonic/database — infrastructure layer.
 * Exposes the Prisma client singleton, the generated Prisma types/enums, and
 * domain repository implementations. Application code depends on the domain
 * ports (from @mnemonic/core); this package wires them to PostgreSQL.
 */
export { prisma, createPrismaClient } from './client.js';
export type { PrismaClient, CreatePrismaClientOptions } from './client.js';

export { WordMapper } from './mappers/word.mapper.js';
export { PrismaWordRepository } from './repositories/prisma-word.repository.js';

// Re-export Prisma-generated types and enums for consumers that need raw access.
export { Prisma } from '@prisma/client';
export type {
  User,
  Profile,
  Word as PrismaWord,
  Exam,
  Subscription,
  Payment,
} from '@prisma/client';
