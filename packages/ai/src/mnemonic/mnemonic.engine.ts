import { slugify, WordStatus, type CreateWordInput, type WordAiContent } from '@mnemonic/core';
import { AiParseError } from '../errors.js';
import type { GenerationCache } from '../cache/generation-cache.js';
import {
  buildMnemonicMessages,
  buildWordMessages,
  MNEMONIC_PROMPT_VERSION,
  WORD_PROMPT_VERSION,
} from '../prompts/mnemonic.prompt.js';
import {
  emptyUsage,
  type AiMessage,
  type AiProvider,
  type AiUsage,
} from '../provider/ai-provider.js';
import {
  generatedMnemonicSetSchema,
  generatedWordSchema,
  type GeneratedMnemonicSet,
  type GeneratedWord,
  type MnemonicRequest,
} from './mnemonic.types.js';

export interface GenerationResult<T> {
  data: T;
  usage: AiUsage;
  model: string;
  cached: boolean;
  raw: string;
}

/** Minimal shape of a Zod schema used to validate model output into `T`. */
interface Parseable<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

export interface MnemonicEngineOptions {
  model?: string;
  temperature?: number;
  cache?: GenerationCache;
  cacheTtlSeconds?: number;
  /** Extra attempts if the model returns unparseable output. Default 1. */
  maxParseRetries?: number;
}

/**
 * Application service that turns a word into learning artifacts. Provider-
 * agnostic (depends on {@link AiProvider}), cache-aware, and DB-free — it
 * returns generation metadata for the caller to persist as `AiHistory`.
 */
export class MnemonicEngine {
  constructor(
    private readonly provider: AiProvider,
    private readonly options: MnemonicEngineOptions = {},
  ) {}

  /** Generate the 11 mnemonic artifacts for a word (meaning already known). */
  async generateMnemonicSet(
    request: MnemonicRequest,
  ): Promise<GenerationResult<GeneratedMnemonicSet>> {
    const cacheKey = `mnemonic:${MNEMONIC_PROMPT_VERSION}:${this.modelKey()}:${slugify(request.word)}`;
    return this.run<GeneratedMnemonicSet>(
      generatedMnemonicSetSchema,
      buildMnemonicMessages(request),
      cacheKey,
    );
  }

  /** Generate a complete word entry (lexical fields + artifacts) from just a word. */
  async generateWord(
    word: string,
    options: { examType?: string } = {},
  ): Promise<GenerationResult<GeneratedWord>> {
    const cacheKey = `word:${WORD_PROMPT_VERSION}:${this.modelKey()}:${slugify(word)}`;
    return this.run<GeneratedWord>(
      generatedWordSchema,
      buildWordMessages(word, options.examType),
      cacheKey,
    );
  }

  /** Map generated artifacts onto the domain `WordAiContent` fields. */
  toWordAiContent(set: GeneratedMnemonicSet): WordAiContent {
    return {
      story: set.story,
      hinglishMnemonic: set.hinglishMnemonic,
      englishMnemonic: set.englishMnemonic,
      memoryTrick: set.memoryTrick,
      visualMemoryPrompt: set.visualImagination,
      imagePrompt: set.imagePrompt,
    };
  }

  /** Map a fully generated word onto the domain `CreateWordInput`. */
  toCreateWordInput(word: string, generated: GeneratedWord): CreateWordInput {
    return {
      word,
      meaning: generated.meaning,
      hindiMeaning: generated.hindiMeaning,
      partOfSpeech: generated.partOfSpeech,
      difficulty: generated.difficulty,
      synonyms: generated.synonyms,
      antonyms: generated.antonyms,
      rootWord: generated.rootWord ?? null,
      exampleSentence: generated.exampleSentence,
      ai: this.toWordAiContent(generated),
      status: WordStatus.PUBLISHED,
    };
  }

  private async run<T>(
    schema: Parseable<T>,
    messages: AiMessage[],
    cacheKey: string,
  ): Promise<GenerationResult<T>> {
    const { model, cache, cacheTtlSeconds } = this.options;

    if (cache) {
      const hit = await cache.get(cacheKey);
      const parsedHit = hit ? tryParse(schema, hit) : null;
      if (parsedHit) {
        return {
          data: parsedHit,
          usage: emptyUsage(this.modelKey()),
          model: this.modelKey(),
          cached: true,
          raw: hit as string,
        };
      }
    }

    const maxRetries = this.options.maxParseRetries ?? 1;
    let lastRaw = '';
    let lastUsage: AiUsage | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const completion = await this.provider.complete({
        messages,
        model,
        temperature: this.options.temperature ?? 0.8,
        responseFormat: 'json',
      });
      lastRaw = completion.content;
      lastUsage = completion.usage;

      const parsed = tryParse(schema, lastRaw);
      if (parsed) {
        if (cache) await cache.set(cacheKey, JSON.stringify(parsed), cacheTtlSeconds);
        return {
          data: parsed,
          usage: completion.usage,
          model: completion.usage.model,
          cached: false,
          raw: lastRaw,
        };
      }
    }

    throw new AiParseError('Model output could not be parsed', { raw: lastRaw, usage: lastUsage });
  }

  private modelKey(): string {
    return this.options.model ?? this.provider.name;
  }
}

function tryParse<T>(schema: Parseable<T>, raw: string): T | null {
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(raw));
  } catch {
    return null;
  }
  const result = schema.safeParse(json);
  return result.success ? result.data : null;
}

/** Strip Markdown code fences a model may wrap JSON in. */
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1]!.trim() : trimmed;
}
