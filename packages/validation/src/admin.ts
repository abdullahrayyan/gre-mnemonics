import { ModerationStatus, ReportStatus } from '@mnemonic/core';
import { z } from 'zod';

/** Body for moderating a community mnemonic. */
export const moderateMnemonicSchema = z.object({
  status: z.nativeEnum(ModerationStatus),
});
export type ModerateMnemonicDto = z.infer<typeof moderateMnemonicSchema>;

/** Body for resolving/dismissing a report. */
export const resolveReportSchema = z.object({
  status: z.nativeEnum(ReportStatus),
});
export type ResolveReportDto = z.infer<typeof resolveReportSchema>;

/** Body for AI-generating and adding a new word. */
export const adminGenerateWordSchema = z.object({
  word: z.string().trim().min(1).max(100),
});
export type AdminGenerateWordDto = z.infer<typeof adminGenerateWordSchema>;
