import { describe, expect, it } from 'vitest';
import { ValidationError } from '../shared/errors.js';
import { Difficulty, PartOfSpeech, WordStatus } from './enums.js';
import { Word, type CreateWordInput } from './word.entity.js';

const validInput = (overrides: Partial<CreateWordInput> = {}): CreateWordInput => ({
  word: 'Bolster',
  difficulty: Difficulty.MEDIUM,
  partOfSpeech: PartOfSpeech.VERB,
  meaning: 'to support or strengthen',
  ...overrides,
});

const opts = { id: 'word_1', now: new Date('2026-01-01T00:00:00.000Z') };

describe('Word.create', () => {
  it('builds a valid word with defaults and derived slug', () => {
    const word = Word.create(validInput(), opts);

    expect(word.id).toBe('word_1');
    expect(word.word).toBe('Bolster');
    expect(word.slug).toBe('bolster');
    expect(word.status).toBe(WordStatus.DRAFT);
    expect(word.createdAt).toEqual(opts.now);
    expect(word.updatedAt).toEqual(opts.now);
  });

  it('trims and de-duplicates synonyms/antonyms case-insensitively', () => {
    const word = Word.create(
      validInput({ synonyms: [' support ', 'Support', 'reinforce', ''] }),
      opts,
    );
    expect(word.synonyms).toEqual(['support', 'reinforce']);
  });

  it('normalizes blank optional fields to null', () => {
    const word = Word.create(validInput({ rootWord: '   ', ipa: '' }), opts);
    const json = word.toJSON();
    expect(json.rootWord).toBeNull();
    expect(json.ipa).toBeNull();
  });

  it('rejects an empty word', () => {
    expect(() => Word.create(validInput({ word: '   ' }), opts)).toThrow(ValidationError);
  });

  it('rejects an invalid difficulty and reports the field', () => {
    try {
      Word.create(validInput({ difficulty: 'IMPOSSIBLE' as Difficulty }), opts);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues.some((i) => i.includes('difficulty'))).toBe(true);
    }
  });

  it('collects multiple invariant violations into one error', () => {
    try {
      Word.create(
        { word: '', difficulty: Difficulty.EASY, partOfSpeech: PartOfSpeech.NOUN, meaning: '' },
        opts,
      );
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as ValidationError).issues.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('rejects a negative frequency', () => {
    expect(() => Word.create(validInput({ frequency: -5 }), opts)).toThrow(ValidationError);
  });
});

describe('Word behavior', () => {
  it('tracks mnemonic completeness', () => {
    const word = Word.create(validInput(), opts);
    expect(word.hasCompleteMnemonics()).toBe(false);

    word.applyAiContent(
      { hinglishMnemonic: 'Bol Sir!', englishMnemonic: 'A bolster supports you' },
      new Date('2026-02-01T00:00:00.000Z'),
    );
    expect(word.hasCompleteMnemonics()).toBe(true);
    expect(word.updatedAt).toEqual(new Date('2026-02-01T00:00:00.000Z'));
  });

  it('refuses to publish without complete mnemonics', () => {
    const word = Word.create(validInput(), opts);
    expect(() => word.publish()).toThrow(ValidationError);
    expect(word.isPublished()).toBe(false);
  });

  it('publishes once mnemonics exist', () => {
    const word = Word.create(validInput(), opts);
    word.applyAiContent({ hinglishMnemonic: 'Bol Sir!', englishMnemonic: 'supports you' });
    word.publish(new Date('2026-03-01T00:00:00.000Z'));
    expect(word.isPublished()).toBe(true);
    expect(word.status).toBe(WordStatus.PUBLISHED);
  });

  it('returns an isolated snapshot from toJSON', () => {
    const word = Word.create(validInput({ synonyms: ['support'] }), opts);
    const snapshot = word.toJSON();
    snapshot.synonyms.push('mutated');
    expect(word.synonyms).toEqual(['support']);
  });
});
