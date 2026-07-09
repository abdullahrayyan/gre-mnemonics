import { buildPage, pageOffset, type Page, type PageRequest } from '@mnemonic/core';
import type { PrismaClient } from '@mnemonic/database';
import type { CommentDto, CommunityMnemonicDto, VoteResultDto } from '@mnemonic/types';
import type {
  AddCommentInput,
  CommunityStore,
  ListMnemonicsFilter,
  ReportInput,
  SubmitMnemonicInput,
} from '../application/community-store.port.js';

type AuthorRow = { email: string; profile: { displayName: string | null } | null };
const authorName = (author: AuthorRow): string =>
  author.profile?.displayName ?? author.email.split('@')[0] ?? 'Learner';

const authorInclude = { select: { email: true, profile: { select: { displayName: true } } } };

/** Prisma-backed {@link CommunityStore}. */
export class PrismaCommunityStore implements CommunityStore {
  constructor(private readonly prisma: PrismaClient) {}

  async listMnemonics(
    filter: ListMnemonicsFilter,
    page: PageRequest,
  ): Promise<Page<CommunityMnemonicDto>> {
    const where = { status: 'APPROVED' as const, ...(filter.wordId ? { wordId: filter.wordId } : {}) };
    const orderBy =
      filter.sort === 'top'
        ? [{ score: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }];

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.communityMnemonic.findMany({
        where,
        orderBy,
        skip: pageOffset(page),
        take: page.pageSize,
        include: {
          word: { select: { word: true } },
          author: authorInclude,
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.communityMnemonic.count({ where }),
    ]);

    const viewerVotes = filter.viewerId
      ? await this.prisma.vote.findMany({
          where: { userId: filter.viewerId, mnemonicId: { in: rows.map((r) => r.id) } },
        })
      : [];
    const voteByMnemonic = new Map(viewerVotes.map((v) => [v.mnemonicId, v.value]));

    const items = rows.map(
      (r): CommunityMnemonicDto => ({
        id: r.id,
        wordId: r.wordId,
        word: r.word.word,
        authorId: r.authorId,
        authorName: authorName(r.author),
        content: r.content,
        type: r.type,
        upvotes: r.upvotes,
        downvotes: r.downvotes,
        score: r.score,
        status: r.status,
        commentCount: r._count.comments,
        viewerVote: voteByMnemonic.get(r.id) ?? 0,
        createdAt: r.createdAt.toISOString(),
      }),
    );
    return buildPage(items, total, page);
  }

  async submitMnemonic(input: SubmitMnemonicInput): Promise<CommunityMnemonicDto> {
    const row = await this.prisma.communityMnemonic.create({
      data: {
        id: input.id,
        wordId: input.wordId,
        authorId: input.authorId,
        content: input.content,
        type: input.type as never,
        status: 'APPROVED',
      },
      include: {
        word: { select: { word: true } },
        author: authorInclude,
        _count: { select: { comments: true } },
      },
    });
    return {
      id: row.id,
      wordId: row.wordId,
      word: row.word.word,
      authorId: row.authorId,
      authorName: authorName(row.author),
      content: row.content,
      type: row.type,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      score: row.score,
      status: row.status,
      commentCount: row._count.comments,
      viewerVote: 0,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async vote(userId: string, mnemonicId: string, value: number): Promise<VoteResultDto> {
    return this.prisma.$transaction(async (tx) => {
      if (value === 0) {
        await tx.vote.deleteMany({ where: { userId, mnemonicId } });
      } else {
        await tx.vote.upsert({
          where: { userId_mnemonicId: { userId, mnemonicId } },
          create: { userId, mnemonicId, value },
          update: { value },
        });
      }
      const [up, down] = await Promise.all([
        tx.vote.count({ where: { mnemonicId, value: 1 } }),
        tx.vote.count({ where: { mnemonicId, value: -1 } }),
      ]);
      await tx.communityMnemonic.update({
        where: { id: mnemonicId },
        data: { upvotes: up, downvotes: down, score: up - down },
      });
      return { mnemonicId, upvotes: up, downvotes: down, score: up - down, viewerVote: value };
    });
  }

  async listComments(mnemonicId: string): Promise<CommentDto[]> {
    const rows = await this.prisma.comment.findMany({
      where: { mnemonicId, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      include: { author: authorInclude },
    });
    const dtos = rows.map(
      (r): CommentDto => ({
        id: r.id,
        mnemonicId: r.mnemonicId,
        parentId: r.parentId,
        authorId: r.authorId,
        authorName: authorName(r.author),
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        replies: [],
      }),
    );
    const byId = new Map(dtos.map((d) => [d.id, d]));
    const roots: CommentDto[] = [];
    for (const dto of dtos) {
      if (dto.parentId && byId.has(dto.parentId)) byId.get(dto.parentId)!.replies.push(dto);
      else roots.push(dto);
    }
    return roots;
  }

  async addComment(input: AddCommentInput): Promise<CommentDto> {
    const row = await this.prisma.comment.create({
      data: {
        id: input.id,
        mnemonicId: input.mnemonicId,
        authorId: input.authorId,
        parentId: input.parentId ?? null,
        content: input.content,
        status: 'APPROVED',
      },
      include: { author: authorInclude },
    });
    return {
      id: row.id,
      mnemonicId: row.mnemonicId,
      parentId: row.parentId,
      authorId: row.authorId,
      authorName: authorName(row.author),
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      replies: [],
    };
  }

  async report(input: ReportInput): Promise<{ id: string }> {
    const row = await this.prisma.report.create({
      data: {
        id: input.id,
        reporterId: input.reporterId,
        targetType: input.targetType as never,
        targetId: input.targetId,
        reason: input.reason as never,
        details: input.details ?? null,
        status: 'OPEN',
      },
    });
    return { id: row.id };
  }
}
