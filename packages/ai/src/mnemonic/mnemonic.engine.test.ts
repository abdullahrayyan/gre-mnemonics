import { describe, expect, it } from 'vitest';
import { InMemoryGenerationCache } from '../cache/generation-cache.js';
import { estimateCostCents } from '../cost.js';
import { AiParseError } from '../errors.js';
import { StubAiProvider } from '../provider/stub-provider.js';
import { MnemonicEngine } from './mnemonic.engine.js';
import type { GeneratedMnemonicSet } from './mnemonic.types.js';

function validSet(overrides: Partial<GeneratedMnemonicSet> = {}): GeneratedMnemonicSet {
  return {
    hinglishMnemonic: 'Bol Sir! — teacher supports you.',
    englishMnemonic: 'A bolster pillow supports your back.',
    story: 'A shy student shouts "Bol Sir!" and the teacher backs him up.',
    beginnerExplanation: 'Bolster means to support or strengthen.',
    hindiExplanation: 'बोल्स्टर का अर्थ है सहारा देना।',
    rootExplanation: 'From Old English bolster, a cushion that supports.',
    realLifeExample: 'The award bolstered her confidence.',
    visualImagination: 'A giant pillow propping up a falling wall.',
    memoryTrick: 'Bolster = Bol + Sir (support).',
    imagePrompt: 'A student shouting while a teacher holds up a wobbling bookshelf.',
    quizQuestions: [
      {
        type: 'WORD_TO_MEANING',
        prompt: 'What does "bolster" mean?',
        options: ['to support', 'to destroy', 'to ignore', 'to sell'],
        correctAnswer: 'to support',
        explanation: 'Bolster means to support or strengthen.',
      },
    ],
    ...overrides,
  };
}

const request = { word: 'Bolster', meaning: 'to support or strengthen' };

describe('MnemonicEngine', () => {
  it('parses a valid model response into a typed set', async () => {
    const provider = new StubAiProvider(JSON.stringify(validSet()));
    const engine = new MnemonicEngine(provider, { model: 'gpt-4o-mini' });

    const result = await engine.generateMnemonicSet(request);

    expect(result.cached).toBe(false);
    expect(provider.calls).toBe(1);
    expect(result.data.hinglishMnemonic).toContain('Bol Sir');
    expect(result.data.quizQuestions).toHaveLength(1);
    expect(result.usage.totalTokens).toBe(46);
  });

  it('strips markdown code fences before parsing', async () => {
    const fenced = '```json\n' + JSON.stringify(validSet()) + '\n```';
    const engine = new MnemonicEngine(new StubAiProvider(fenced));
    const result = await engine.generateMnemonicSet(request);
    expect(result.data.story).toContain('Bol Sir');
  });

  it('coerces free-form quiz types to enum members', async () => {
    const set = validSet({
      quizQuestions: [
        {
          type: 'word to meaning' as never,
          prompt: 'q',
          options: ['a', 'b'],
          correctAnswer: 'a',
          explanation: '',
        },
      ],
    });
    const engine = new MnemonicEngine(new StubAiProvider(JSON.stringify(set)));
    const result = await engine.generateMnemonicSet(request);
    expect(result.data.quizQuestions[0]!.type).toBe('WORD_TO_MEANING');
  });

  it('serves a cache hit without calling the provider again', async () => {
    const provider = new StubAiProvider(JSON.stringify(validSet()));
    const cache = new InMemoryGenerationCache();
    const engine = new MnemonicEngine(provider, { model: 'gpt-4o-mini', cache });

    const first = await engine.generateMnemonicSet(request);
    const second = await engine.generateMnemonicSet(request);

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(provider.calls).toBe(1);
    expect(second.data).toEqual(first.data);
  });

  it('retries once on unparseable output then succeeds', async () => {
    const provider = new StubAiProvider(['not json at all', JSON.stringify(validSet())]);
    const engine = new MnemonicEngine(provider);

    const result = await engine.generateMnemonicSet(request);

    expect(provider.calls).toBe(2);
    expect(result.data.memoryTrick).toContain('Bol');
  });

  it('throws AiParseError when output never parses', async () => {
    const provider = new StubAiProvider('still not json');
    const engine = new MnemonicEngine(provider, { maxParseRetries: 1 });

    await expect(engine.generateMnemonicSet(request)).rejects.toBeInstanceOf(AiParseError);
    expect(provider.calls).toBe(2);
  });

  it('maps the set onto domain WordAiContent', async () => {
    const engine = new MnemonicEngine(new StubAiProvider(JSON.stringify(validSet())));
    const { data } = await engine.generateMnemonicSet(request);
    const content = engine.toWordAiContent(data);

    expect(content.visualMemoryPrompt).toBe(data.visualImagination);
    expect(content.hinglishMnemonic).toBe(data.hinglishMnemonic);
    expect(content.imagePrompt).toBe(data.imagePrompt);
  });
});

describe('estimateCostCents', () => {
  it('prices known models and rounds up to cents', () => {
    const cents = estimateCostCents({
      model: 'gpt-4o',
      promptTokens: 1_000_000,
      completionTokens: 1_000_000,
      totalTokens: 2_000_000,
      latencyMs: 0,
    });
    // $2.50 input + $10 output = $12.50 => 1250 cents
    expect(cents).toBe(1250);
  });

  it('falls back to a default price for unknown models', () => {
    const cents = estimateCostCents({
      model: 'some-future-model',
      promptTokens: 1000,
      completionTokens: 1000,
      totalTokens: 2000,
      latencyMs: 0,
    });
    expect(cents).toBeGreaterThanOrEqual(1);
  });
});
