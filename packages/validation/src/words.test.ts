import { describe, expect, it } from 'vitest';
import { createWordSchema, updateWordSchema, wordSearchQuerySchema } from './words.js';

describe('createWordSchema', () => {
  it('accepts a valid word', () => {
    const parsed = createWordSchema.parse({
      word: 'Bolster',
      difficulty: 'MEDIUM',
      partOfSpeech: 'VERB',
      meaning: 'to support',
    });
    expect(parsed.word).toBe('Bolster');
  });

  it('rejects an invalid difficulty', () => {
    const result = createWordSchema.safeParse({
      word: 'x',
      difficulty: 'NOPE',
      partOfSpeech: 'VERB',
      meaning: 'm',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty word', () => {
    const result = createWordSchema.safeParse({
      word: '',
      difficulty: 'EASY',
      partOfSpeech: 'NOUN',
      meaning: 'm',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateWordSchema', () => {
  it('requires at least one field', () => {
    expect(updateWordSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a partial update', () => {
    expect(updateWordSchema.safeParse({ meaning: 'new meaning' }).success).toBe(true);
  });
});

describe('wordSearchQuerySchema', () => {
  it('coerces numeric params and boolean strings', () => {
    const parsed = wordSearchQuerySchema.parse({
      page: '2',
      pageSize: '10',
      hasMnemonics: 'true',
      sort: 'word',
      order: 'asc',
    });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(10);
    expect(parsed.hasMnemonics).toBe(true);
    expect(parsed.sort).toBe('word');
  });

  it('rejects an out-of-range pageSize', () => {
    expect(wordSearchQuerySchema.safeParse({ pageSize: '5000' }).success).toBe(false);
  });
});
