import type { User, UserRepository } from '@mnemonic/core';
import type {
  ProfileData,
  ProfileRepository,
  UpdateProfileData,
} from '../application/profile.port.js';

/** In-memory user repository for tests. */
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    for (const user of this.byId.values()) {
      if (user.clerkId === clerkId) return user;
    }
    return null;
  }

  async create(user: User): Promise<User> {
    this.byId.set(user.id, user);
    return user;
  }

  async update(user: User): Promise<User> {
    this.byId.set(user.id, user);
    return user;
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    for (const [id, user] of this.byId) {
      if (user.clerkId === clerkId) this.byId.delete(id);
    }
  }
}

function defaultProfile(userId: string): ProfileData {
  return {
    userId,
    displayName: null,
    avatarUrl: null,
    nativeLanguage: 'HI',
    targetExam: 'GRE',
    dailyWordGoal: 20,
    timezone: 'UTC',
    bio: null,
    preferences: {},
  };
}

/** In-memory profile repository for tests. */
export class InMemoryProfileRepository implements ProfileRepository {
  private readonly byUser = new Map<string, ProfileData>();

  seed(userId: string): void {
    this.byUser.set(userId, defaultProfile(userId));
  }

  async findByUserId(userId: string): Promise<ProfileData | null> {
    return this.byUser.get(userId) ?? null;
  }

  async update(userId: string, data: UpdateProfileData): Promise<ProfileData> {
    const current = this.byUser.get(userId) ?? defaultProfile(userId);
    const next: ProfileData = { ...current };
    for (const key of Object.keys(data) as (keyof UpdateProfileData)[]) {
      const value = data[key];
      if (value !== undefined) {
        (next as unknown as Record<string, unknown>)[key] = value;
      }
    }
    this.byUser.set(userId, next);
    return next;
  }
}
