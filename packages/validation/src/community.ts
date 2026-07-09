import { MnemonicType, ReportReason, ReportTargetType } from '@mnemonic/core';
import { z } from 'zod';

/** Body for submitting a community mnemonic (`POST /community/mnemonics`). */
export const submitMnemonicSchema = z.object({
  wordId: z.string().trim().min(1),
  content: z.string().trim().min(3).max(500),
  type: z.nativeEnum(MnemonicType).optional(),
});
export type SubmitMnemonicDto = z.infer<typeof submitMnemonicSchema>;

/** Body for voting on a mnemonic: 1 (up), -1 (down), 0 (clear). */
export const voteSchema = z.object({
  value: z.coerce.number().int().min(-1).max(1),
});
export type VoteDto = z.infer<typeof voteSchema>;

/** Body for adding a (optionally threaded) comment. */
export const addCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  parentId: z.string().trim().min(1).nullish(),
});
export type AddCommentDto = z.infer<typeof addCommentSchema>;

/** Body for reporting content for moderation. */
export const reportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetId: z.string().trim().min(1),
  reason: z.nativeEnum(ReportReason),
  details: z.string().trim().max(1000).nullish(),
});
export type ReportDto = z.infer<typeof reportSchema>;

/** Query for listing community mnemonics. */
export const communityListQuerySchema = z.object({
  wordId: z.string().trim().min(1).optional(),
  sort: z.enum(['new', 'top']).default('new'),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});
export type CommunityListQueryDto = z.infer<typeof communityListQuerySchema>;
