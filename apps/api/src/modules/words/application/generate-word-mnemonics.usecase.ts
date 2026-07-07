import { AiError, estimateCostCents, type MnemonicEngine } from '@mnemonic/ai';
import { NotFoundError, type Word, type WordRepository } from '@mnemonic/core';
import { AppError } from '../../../shared/http/http-error.js';
import type { AiHistoryRecorder } from './ai-history.port.js';

/**
 * Generate AI mnemonic content for a word, persist it, and record the
 * generation (success or failure) as `AiHistory`. Returns 503 semantics when the
 * AI engine is not configured (no OpenAI key).
 */
export class GenerateWordMnemonicsUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly engine: MnemonicEngine | null,
    private readonly history: AiHistoryRecorder,
  ) {}

  async execute(id: string): Promise<Word> {
    if (!this.engine) {
      throw new AppError('AI generation is not configured', {
        statusCode: 503,
        code: 'AI_UNAVAILABLE',
      });
    }

    const word = await this.words.findById(id);
    if (!word) throw new NotFoundError('Word', id);

    try {
      const result = await this.engine.generateMnemonicSet({
        word: word.word,
        meaning: word.meaning,
        partOfSpeech: word.partOfSpeech,
        difficulty: word.difficulty,
      });

      word.applyAiContent(this.engine.toWordAiContent(result.data));
      const saved = await this.words.update(word);

      await this.history.record({
        wordId: word.id,
        type: 'MNEMONIC_SET',
        model: result.model,
        prompt: `mnemonic-set:${word.word}`,
        response: result.data,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        costCents: estimateCostCents(result.usage),
        latencyMs: result.usage.latencyMs,
        status: 'SUCCESS',
      });

      return saved;
    } catch (error) {
      await this.history.record({
        wordId: word.id,
        type: 'MNEMONIC_SET',
        model: this.engineModel(),
        prompt: `mnemonic-set:${word.word}`,
        status: 'FAILURE',
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof AiError) {
        throw new AppError('AI generation failed', {
          statusCode: 502,
          code: 'AI_GENERATION_FAILED',
          cause: error,
        });
      }
      throw error;
    }
  }

  private engineModel(): string {
    return 'unknown';
  }
}
