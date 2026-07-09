import { normalizePageRequest, type Page } from '@mnemonic/core';
import type { CommentDto, CommunityMnemonicDto, VoteResultDto } from '@mnemonic/types';
import type {
  CommunityStore,
  ListMnemonicsFilter,
  ReportInput,
} from './community-store.port.js';

export class ListCommunityMnemonicsUseCase {
  constructor(private readonly store: CommunityStore) {}
  execute(
    filter: ListMnemonicsFilter,
    page: { page?: number; pageSize?: number },
  ): Promise<Page<CommunityMnemonicDto>> {
    return this.store.listMnemonics(filter, normalizePageRequest(page));
  }
}

export class SubmitMnemonicUseCase {
  constructor(
    private readonly store: CommunityStore,
    private readonly generateId: () => string,
  ) {}
  execute(input: {
    wordId: string;
    authorId: string;
    content: string;
    type?: string;
  }): Promise<CommunityMnemonicDto> {
    return this.store.submitMnemonic({
      id: this.generateId(),
      wordId: input.wordId,
      authorId: input.authorId,
      content: input.content,
      type: input.type ?? 'HINGLISH',
    });
  }
}

export class VoteMnemonicUseCase {
  constructor(private readonly store: CommunityStore) {}
  execute(userId: string, mnemonicId: string, value: number): Promise<VoteResultDto> {
    const clamped = Math.max(-1, Math.min(1, Math.trunc(value)));
    return this.store.vote(userId, mnemonicId, clamped);
  }
}

export class ListCommentsUseCase {
  constructor(private readonly store: CommunityStore) {}
  execute(mnemonicId: string): Promise<CommentDto[]> {
    return this.store.listComments(mnemonicId);
  }
}

export class AddCommentUseCase {
  constructor(
    private readonly store: CommunityStore,
    private readonly generateId: () => string,
  ) {}
  execute(input: {
    mnemonicId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }): Promise<CommentDto> {
    return this.store.addComment({ id: this.generateId(), ...input });
  }
}

export class ReportContentUseCase {
  constructor(
    private readonly store: CommunityStore,
    private readonly generateId: () => string,
  ) {}
  execute(input: Omit<ReportInput, 'id'>): Promise<{ id: string }> {
    return this.store.report({ id: this.generateId(), ...input });
  }
}
