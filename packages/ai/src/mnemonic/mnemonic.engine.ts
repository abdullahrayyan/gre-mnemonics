import { slugify, type WordAiContent } from '@mnemonic/core';
import { AiParseError } from '../errors.js';
import type { GenerationCache } from '../cache/generation-cache.js';
import { buildMnemonicMessages, MNEMONIC_PROMPT_VERSION } from '../prompts/mnemonic.prompt.js';
import { emptyUsage, type AiProvider, type AiUsage } from '../provider/ai-provider.js';
import {
  generatedMnemonicSetSchema,
  type GeneratedMnemonicSet,
  type MnemonicRequest,
} from './mnemonic.types.js';

export interface GenerationResult<T> {
  data: T;
  usage: AiUsage;
  model: string;
  cached: boolean;
  raw: string;
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
 * Application service that turns a word into the full set of learning artifacts.
 * Provider-agnostic (depends on the {@link AiProvider} port), cache-aware, and
 * DB-free — it returns generation metadata for the caller to persist as
 * `AiHistory`, so this layer never imports infrastructure.
 */
export class MnemonicEngine {
  constructor(
    private readonly provider: AiProvider,
    private readonly options: MnemonicEngineOptions = {},
  ) {}

  async generateMnemonicSet(
    request: MnemonicRequest,
  ): Promise<GenerationResult<GeneratedMnemonicSet>> {
    const { model, cache, cacheTtlSeconds } = this.options;
    const cacheKey = this.cacheKey(request, model);

    if (cache) {
      const hit = await cache.get(cacheKey);
      const parsedHit = hit ? this.tryParse(hit) : null;
      if (parsedHit) {
        return {
          data: parsedHit,
          usage: emptyUsage(model ?? this.provider.name),
          model: model ?? this.provider.name,
          cached: true,
          raw: hit as string,
        };
      }
    }

    const messages = buildMnemonicMessages(request);
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

      const parsed = this.tryParse(lastRaw);
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

    throw new AiParseError('Model output could not be parsed into a mnemonic set', {
      raw: lastRaw,
      usage: lastUsage,
    });
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

  private tryParse(raw: string): GeneratedMnemonicSet | null {
    let json: unknown;
    try {
      json = JSON.parse(stripCodeFences(raw));
    } catch {
      return null;
    }
    const result = generatedMnemonicSetSchema.safeParse(json);
    return result.success ? result.data : null;
  }

  private cacheKey(request: MnemonicRequest, model?: string): string {
    return `mnemonic:${MNEMONIC_PROMPT_VERSION}:${model ?? 'default'}:${slugify(request.word)}`;
  }
}

/** Strip Markdown code fences a model may wrap JSON in. */
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1]!.trim() : trimmed;
}
