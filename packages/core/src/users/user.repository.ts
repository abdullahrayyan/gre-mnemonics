import type { User } from './user.entity.js';

/** Persistence port for the User aggregate. */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  deleteByClerkId(clerkId: string): Promise<void>;
}
