import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type {
  ProfileData,
  ProfileRepository,
  UpdateProfileData,
} from '../application/profile.port.js';

interface ProfileRow {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  nativeLanguage: string;
  targetExam: string;
  dailyWordGoal: number;
  timezone: string;
  bio: string | null;
  preferences: unknown;
}

function toData(row: ProfileRow): ProfileData {
  return {
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    nativeLanguage: row.nativeLanguage,
    targetExam: row.targetExam,
    dailyWordGoal: row.dailyWordGoal,
    timezone: row.timezone,
    bio: row.bio,
    preferences: (row.preferences as Record<string, unknown> | null) ?? {},
  };
}

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<ProfileData | null> {
    const row = await this.prisma.profile.findUnique({ where: { userId } });
    return row ? toData(row) : null;
  }

  async update(userId: string, data: UpdateProfileData): Promise<ProfileData> {
    const row = await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        nativeLanguage: data.nativeLanguage as Prisma.ProfileUpdateInput['nativeLanguage'],
        targetExam: data.targetExam as Prisma.ProfileUpdateInput['targetExam'],
        dailyWordGoal: data.dailyWordGoal,
        timezone: data.timezone,
        bio: data.bio,
        ...(data.preferences !== undefined
          ? { preferences: data.preferences as Prisma.InputJsonValue }
          : {}),
      },
    });
    return toData(row);
  }
}
