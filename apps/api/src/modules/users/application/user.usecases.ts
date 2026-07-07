import { NotFoundError, type User, type UserRepository } from '@mnemonic/core';
import type { ProfileData, ProfileRepository, UpdateProfileData } from './profile.port.js';

/** Load the current user together with their profile. */
export class GetMeUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  async execute(userId: string): Promise<{ user: User; profile: ProfileData | null }> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User', userId);
    const profile = await this.profiles.findByUserId(userId);
    return { user, profile };
  }
}

/** Update the current user's profile. */
export class UpdateProfileUseCase {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(userId: string, data: UpdateProfileData): Promise<ProfileData> {
    return this.profiles.update(userId, data);
  }
}
