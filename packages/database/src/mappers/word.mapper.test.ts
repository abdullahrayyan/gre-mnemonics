import { Difficulty, PartOfSpeech, Word, WordStatus } from '@mnemonic/core';
import type { Word as PrismaWord } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { WordMapper } from './word.mapper.js';

const now = new Date('2026-01-01T00:00:00.000Z');

function fakeRow(overrides: Partial<PrismaWord> = {}): PrismaWord {
  return {
    id: 'word_1',
    word: 'Bolster',
    slug: 'bolster',
    pronunciation: 'BOHL-ster',
    ipa: '/ˈboʊl.stɚ/',
    difficulty: Difficulty.MEDIUM,
    frequency: 42,
    partOfSpeech: PartOfSpeech.VERB,
    meaning: 'to support or strengthen',
    hindiMeaning: 'सहारा देना',
    synonyms: ['support', 'reinforce'],
    antonyms: ['undermine'],
    rootWord: null,
    prefix: null,
    suffix: null,
    etymology: null,
    exampleSentence: 'The good news bolstered her confidence.',
    commonMistakes: null,
    aiStory: null,
    hinglishMnemonic: 'Bol Sir! Teacher supports you.',
    englishMnemonic: 'A bolster (pillow) supports your back.',
    memoryTrick: null,
    visualMemoryPrompt: null,
    imagePrompt: null,
    status: WordStatus.PUBLISHED,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('WordMapper', () => {
  it('maps a persistence row to a domain entity', () => {
    const word = WordMapper.toDomain(fakeRow());

    expect(word).toBeInstanceOf(Word);
    expect(word.id).toBe('word_1');
    expect(word.difficulty).toBe(Difficulty.MEDIUM);
    expect(word.synonyms).toEqual(['support', 'reinforce']);
    expect(word.ai.hinglishMnemonic).toContain('Bol Sir');
    expect(word.hasCompleteMnemonics()).toBe(true);
    expect(word.isPublished()).toBe(true);
  });

  it('maps a domain entity to a Prisma create input (flattening AI content)', () => {
    const word = Word.create(
      {
        word: 'Ephemeral',
        difficulty: Difficulty.HARD,
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        meaning: 'lasting a very short time',
        ai: { hinglishMnemonic: 'A-FEMoral', englishMnemonic: 'here then gone' },
      },
      { id: 'word_2', now },
    );

    const input = WordMapper.toCreateInput(word);

    expect(input.id).toBe('word_2');
    expect(input.slug).toBe('ephemeral');
    expect(input.hinglishMnemonic).toBe('A-FEMoral');
    expect(input.englishMnemonic).toBe('here then gone');
    expect(input.difficulty).toBe(Difficulty.HARD);
  });

  it('round-trips a domain entity through create-input and back', () => {
    const original = WordMapper.toDomain(fakeRow());
    const input = WordMapper.toCreateInput(original);
    const rebuilt = WordMapper.toDomain(input as PrismaWord);

    expect(rebuilt.toJSON()).toEqual(original.toJSON());
  });
});
