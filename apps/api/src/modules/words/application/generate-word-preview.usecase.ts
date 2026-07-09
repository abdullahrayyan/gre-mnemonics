import type { MnemonicEngine } from '@mnemonic/ai';
import { Word, WordStatus } from '@mnemonic/core';
import { AppError } from '../../../shared/http/http-error.js';
import { toWordResponse, type WordResponse } from './word.dto.js';

/**
 * Generate a full learning entry for ANY word on demand — without persisting it.
 * Powers the "look up any word" feature for learners (not just the seeded corpus).
 */
export class GenerateWordPreviewUseCase {
  constructor(private readonly engine: MnemonicEngine | null) {}

  async execute(word: string): Promise<WordResponse> {
    if (!this.engine) {
      throw AppError.unprocessable('AI generation is not configured (set OPENAI_API_KEY).');
    }
    const result = await this.engine.generateWord(word, { examType: 'GRE' });
    const entity = Word.create(
      { ...this.engine.toCreateWordInput(word, result.data), status: WordStatus.PUBLISHED },
      { id: 'preview' },
    );
    return toWordResponse(entity);
  }
}
