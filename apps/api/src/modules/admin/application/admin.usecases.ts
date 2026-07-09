import type { MnemonicEngine } from '@mnemonic/ai';
import { Word, WordStatus, type WordRepository } from '@mnemonic/core';
import type {
  AdminOverviewDto,
  CommunityMnemonicDto,
  ReportDto,
} from '@mnemonic/types';
import { AppError } from '../../../shared/http/http-error.js';
import type { CommunityStore } from '../../community/application/community-store.port.js';
import { toWordResponse, type WordResponse } from '../../words/application/word.dto.js';

/** Aggregate platform counts for the admin dashboard. */
export class GetAdminOverviewUseCase {
  constructor(
    private readonly community: CommunityStore,
    private readonly words: WordRepository,
    private readonly countUsers: () => Promise<number>,
  ) {}
  async execute(): Promise<AdminOverviewDto> {
    const [wordPage, mnemonics, openReports, users] = await Promise.all([
      this.words.search({}, { page: 1, pageSize: 1 }),
      this.community.countMnemonics(),
      this.community.countOpenReports(),
      this.countUsers(),
    ]);
    return { words: wordPage.total, mnemonics, openReports, users };
  }
}

export class ListModerationMnemonicsUseCase {
  constructor(private readonly community: CommunityStore) {}
  execute(limit = 100): Promise<CommunityMnemonicDto[]> {
    return this.community.listAllMnemonics(Math.min(Math.max(limit, 1), 200));
  }
}

export class ModerateMnemonicUseCase {
  constructor(private readonly community: CommunityStore) {}
  execute(id: string, status: string): Promise<void> {
    return this.community.moderateMnemonic(id, status);
  }
}

export class ListReportsUseCase {
  constructor(private readonly community: CommunityStore) {}
  execute(): Promise<ReportDto[]> {
    return this.community.listReports();
  }
}

export class ResolveReportUseCase {
  constructor(private readonly community: CommunityStore) {}
  execute(id: string, status: string, resolverId: string): Promise<void> {
    return this.community.resolveReport(id, status, resolverId);
  }
}

/** Generate a full learning entry for a new word via AI and publish it. */
export class AdminGenerateWordUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly engine: MnemonicEngine | null,
    private readonly generateId: () => string,
  ) {}
  async execute(word: string): Promise<WordResponse> {
    if (!this.engine) {
      throw AppError.unprocessable('AI generation is not configured (set OPENAI_API_KEY).');
    }
    const existing = await this.words.findByWord(word);
    if (existing) return toWordResponse(existing);

    const result = await this.engine.generateWord(word, { examType: 'GRE' });
    const entity = Word.create(
      { ...this.engine.toCreateWordInput(word, result.data), status: WordStatus.PUBLISHED },
      { id: this.generateId() },
    );
    const saved = await this.words.create(entity);
    return toWordResponse(saved);
  }
}
