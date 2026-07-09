import { buildPage, pageOffset, type Page, type PageRequest } from '@mnemonic/core';
import type { CommentDto, CommunityMnemonicDto, VoteResultDto } from '@mnemonic/types';
import type {
  AddCommentInput,
  CommunityStore,
  ListMnemonicsFilter,
  ReportInput,
  SubmitMnemonicInput,
} from '../application/community-store.port.js';

interface MemMnemonic {
  id: string;
  wordId: string;
  word: string;
  authorId: string;
  authorName: string;
  content: string;
  type: string;
  status: string;
  createdAt: Date;
}

interface MemComment {
  id: string;
  mnemonicId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

/** Seed record for the demo (votes are a map of userId → 1|-1). */
export interface SeedMnemonic {
  id: string;
  wordId: string;
  word: string;
  authorId: string;
  authorName: string;
  content: string;
  type?: string;
  createdAt: Date;
  votes?: Record<string, number>;
}

/**
 * In-memory {@link CommunityStore}. Vote tallies are derived from the vote map
 * so counts stay consistent. New submissions are APPROVED immediately (the demo
 * has no moderation queue; reporting flags content for the Phase 13 admin panel).
 */
export class InMemoryCommunityStore implements CommunityStore {
  private readonly mnemonics: MemMnemonic[] = [];
  private readonly votes = new Map<string, Map<string, number>>();
  private readonly comments: MemComment[] = [];
  private readonly reports: (ReportInput & { createdAt: Date })[] = [];

  constructor(
    private readonly resolveWord: (wordId: string) => string,
    private readonly resolveAuthor: (userId: string) => string,
  ) {}

  seedMnemonic(seed: SeedMnemonic): void {
    this.mnemonics.push({
      id: seed.id,
      wordId: seed.wordId,
      word: seed.word,
      authorId: seed.authorId,
      authorName: seed.authorName,
      content: seed.content,
      type: seed.type ?? 'HINGLISH',
      status: 'APPROVED',
      createdAt: seed.createdAt,
    });
    if (seed.votes) {
      const map = new Map<string, number>(Object.entries(seed.votes));
      this.votes.set(seed.id, map);
    }
  }

  seedComment(input: AddCommentInput & { authorName: string; createdAt: Date }): void {
    this.comments.push({
      id: input.id,
      mnemonicId: input.mnemonicId,
      parentId: input.parentId ?? null,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      createdAt: input.createdAt,
    });
  }

  private counts(mnemonicId: string): { upvotes: number; downvotes: number; score: number } {
    let upvotes = 0;
    let downvotes = 0;
    for (const value of this.votes.get(mnemonicId)?.values() ?? []) {
      if (value > 0) upvotes += 1;
      else if (value < 0) downvotes += 1;
    }
    return { upvotes, downvotes, score: upvotes - downvotes };
  }

  private toDto(m: MemMnemonic, viewerId?: string): CommunityMnemonicDto {
    const { upvotes, downvotes, score } = this.counts(m.id);
    return {
      id: m.id,
      wordId: m.wordId,
      word: m.word,
      authorId: m.authorId,
      authorName: m.authorName,
      content: m.content,
      type: m.type,
      upvotes,
      downvotes,
      score,
      status: m.status,
      commentCount: this.comments.filter((c) => c.mnemonicId === m.id).length,
      viewerVote: viewerId ? (this.votes.get(m.id)?.get(viewerId) ?? 0) : 0,
      createdAt: m.createdAt.toISOString(),
    };
  }

  async listMnemonics(filter: ListMnemonicsFilter, page: PageRequest): Promise<Page<CommunityMnemonicDto>> {
    let items = this.mnemonics.filter((m) => m.status === 'APPROVED');
    if (filter.wordId) items = items.filter((m) => m.wordId === filter.wordId);

    const sorted = [...items].sort((a, b) => {
      if (filter.sort === 'top') {
        const diff = this.counts(b.id).score - this.counts(a.id).score;
        if (diff !== 0) return diff;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const start = pageOffset(page);
    const slice = sorted.slice(start, start + page.pageSize);
    return buildPage(slice.map((m) => this.toDto(m, filter.viewerId)), sorted.length, page);
  }

  async submitMnemonic(input: SubmitMnemonicInput): Promise<CommunityMnemonicDto> {
    const record: MemMnemonic = {
      id: input.id,
      wordId: input.wordId,
      word: this.resolveWord(input.wordId),
      authorId: input.authorId,
      authorName: this.resolveAuthor(input.authorId),
      content: input.content,
      type: input.type,
      status: 'APPROVED',
      createdAt: new Date(),
    };
    this.mnemonics.unshift(record);
    return this.toDto(record, input.authorId);
  }

  async vote(userId: string, mnemonicId: string, value: number): Promise<VoteResultDto> {
    let map = this.votes.get(mnemonicId);
    if (!map) {
      map = new Map();
      this.votes.set(mnemonicId, map);
    }
    if (value === 0) map.delete(userId);
    else map.set(userId, value);
    const { upvotes, downvotes, score } = this.counts(mnemonicId);
    return { mnemonicId, upvotes, downvotes, score, viewerVote: value };
  }

  async listComments(mnemonicId: string): Promise<CommentDto[]> {
    const all = this.comments.filter((c) => c.mnemonicId === mnemonicId);
    const toDto = (c: MemComment): CommentDto => ({
      id: c.id,
      mnemonicId: c.mnemonicId,
      parentId: c.parentId,
      authorId: c.authorId,
      authorName: c.authorName,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      replies: all
        .filter((r) => r.parentId === c.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map(toDto),
    });
    return all
      .filter((c) => c.parentId === null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(toDto);
  }

  async addComment(input: AddCommentInput): Promise<CommentDto> {
    const record: MemComment = {
      id: input.id,
      mnemonicId: input.mnemonicId,
      parentId: input.parentId ?? null,
      authorId: input.authorId,
      authorName: this.resolveAuthor(input.authorId),
      content: input.content,
      createdAt: new Date(),
    };
    this.comments.push(record);
    return {
      id: record.id,
      mnemonicId: record.mnemonicId,
      parentId: record.parentId,
      authorId: record.authorId,
      authorName: record.authorName,
      content: record.content,
      createdAt: record.createdAt.toISOString(),
      replies: [],
    };
  }

  async report(input: ReportInput): Promise<{ id: string }> {
    this.reports.push({ ...input, createdAt: new Date() });
    return { id: input.id };
  }
}
