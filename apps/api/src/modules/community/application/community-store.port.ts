import type { Page, PageRequest } from '@mnemonic/core';
import type {
  CommentDto,
  CommunityMnemonicDto,
  ReportDto,
  VoteResultDto,
} from '@mnemonic/types';

export interface ListMnemonicsFilter {
  wordId?: string;
  sort: 'new' | 'top';
  viewerId?: string;
}

export interface SubmitMnemonicInput {
  id: string;
  wordId: string;
  authorId: string;
  content: string;
  type: string;
}

export interface AddCommentInput {
  id: string;
  mnemonicId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
}

export interface ReportInput {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
}

/**
 * Persistence port for the community feature: submitted mnemonics, votes,
 * threaded comments, and moderation reports. Prisma + in-memory adapters.
 */
export interface CommunityStore {
  listMnemonics(
    filter: ListMnemonicsFilter,
    page: PageRequest,
  ): Promise<Page<CommunityMnemonicDto>>;
  submitMnemonic(input: SubmitMnemonicInput): Promise<CommunityMnemonicDto>;
  vote(userId: string, mnemonicId: string, value: number): Promise<VoteResultDto>;
  listComments(mnemonicId: string): Promise<CommentDto[]>;
  addComment(input: AddCommentInput): Promise<CommentDto>;
  report(input: ReportInput): Promise<{ id: string }>;

  // ── Admin / moderation ──
  listAllMnemonics(limit: number): Promise<CommunityMnemonicDto[]>;
  moderateMnemonic(id: string, status: string): Promise<void>;
  listReports(): Promise<ReportDto[]>;
  resolveReport(id: string, status: string, resolverId: string): Promise<void>;
  countMnemonics(): Promise<number>;
  countOpenReports(): Promise<number>;
}
