export interface ProfileData {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  nativeLanguage: string;
  targetExam: string;
  dailyWordGoal: number;
  timezone: string;
  bio: string | null;
  preferences: Record<string, unknown>;
}

export interface UpdateProfileData {
  displayName?: string | null;
  avatarUrl?: string | null;
  nativeLanguage?: string;
  targetExam?: string;
  dailyWordGoal?: number;
  timezone?: string;
  bio?: string | null;
  preferences?: Record<string, unknown>;
}

/** Persistence port for user profiles. */
export interface ProfileRepository {
  findByUserId(userId: string): Promise<ProfileData | null>;
  update(userId: string, data: UpdateProfileData): Promise<ProfileData>;
}
