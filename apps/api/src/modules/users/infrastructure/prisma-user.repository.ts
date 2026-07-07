import { User, type UserRepository } from '@mnemonic/core';
import type { PrismaClient } from '@mnemonic/database';

interface UserRow {
  id: string;
  clerkId: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDomain(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    clerkId: row.clerkId,
    email: row.email,
    role: row.role as User['role'],
    status: row.status as User['status'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Prisma-backed user repository. On create it provisions the user's onboarding
 * records (Profile, GamificationProfile, and a FREE Subscription) in a single
 * atomic insert.
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { clerkId } });
    return row ? toDomain(row) : null;
  }

  async create(user: User): Promise<User> {
    const p = user.toJSON();
    const row = await this.prisma.user.create({
      data: {
        id: p.id,
        clerkId: p.clerkId,
        email: p.email,
        role: p.role,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        profile: { create: {} },
        gamification: { create: {} },
        subscription: { create: {} },
      },
    });
    return toDomain(row);
  }

  async update(user: User): Promise<User> {
    const p = user.toJSON();
    const row = await this.prisma.user.update({
      where: { id: p.id },
      data: { email: p.email, role: p.role, status: p.status, updatedAt: p.updatedAt },
    });
    return toDomain(row);
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { clerkId } });
  }
}
