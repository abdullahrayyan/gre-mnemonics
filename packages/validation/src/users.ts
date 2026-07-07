import { ExamType, Language } from '@mnemonic/core';
import { z } from 'zod';

/** Body schema for updating the current user's profile (partial). */
export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().max(100).nullish(),
    avatarUrl: z.string().url().max(2000).nullish(),
    nativeLanguage: z.nativeEnum(Language).optional(),
    targetExam: z.nativeEnum(ExamType).optional(),
    dailyWordGoal: z.number().int().min(1).max(500).optional(),
    timezone: z.string().trim().max(64).optional(),
    bio: z.string().trim().max(1000).nullish(),
    preferences: z.record(z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
