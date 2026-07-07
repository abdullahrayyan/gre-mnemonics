import { Word, type WordProps } from '@mnemonic/core';
import type { Prisma, Word as PrismaWord } from '@prisma/client';

/**
 * Translates between the persistence model (Prisma row) and the domain model
 * (core `Word` entity). Keeping this at the infrastructure boundary means the
 * domain never learns the shape of the database, and vice versa.
 *
 * The domain enums and the Prisma enums share identical string members, so
 * their union types are structurally assignable — no casts required.
 */
export const WordMapper = {
  toDomain(row: PrismaWord): Word {
    const props: WordProps = {
      id: row.id,
      word: row.word,
      slug: row.slug,
      pronunciation: row.pronunciation,
      ipa: row.ipa,
      difficulty: row.difficulty,
      frequency: row.frequency,
      partOfSpeech: row.partOfSpeech,
      meaning: row.meaning,
      hindiMeaning: row.hindiMeaning,
      synonyms: row.synonyms,
      antonyms: row.antonyms,
      rootWord: row.rootWord,
      prefix: row.prefix,
      suffix: row.suffix,
      etymology: row.etymology,
      exampleSentence: row.exampleSentence,
      commonMistakes: row.commonMistakes,
      ai: {
        story: row.aiStory,
        hinglishMnemonic: row.hinglishMnemonic,
        englishMnemonic: row.englishMnemonic,
        memoryTrick: row.memoryTrick,
        visualMemoryPrompt: row.visualMemoryPrompt,
        imagePrompt: row.imagePrompt,
      },
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Word.reconstitute(props);
  },

  toCreateInput(word: Word): Prisma.WordUncheckedCreateInput {
    const p = word.toJSON();
    return {
      id: p.id,
      word: p.word,
      slug: p.slug,
      pronunciation: p.pronunciation,
      ipa: p.ipa,
      difficulty: p.difficulty,
      frequency: p.frequency,
      partOfSpeech: p.partOfSpeech,
      meaning: p.meaning,
      hindiMeaning: p.hindiMeaning,
      synonyms: p.synonyms,
      antonyms: p.antonyms,
      rootWord: p.rootWord,
      prefix: p.prefix,
      suffix: p.suffix,
      etymology: p.etymology,
      exampleSentence: p.exampleSentence,
      commonMistakes: p.commonMistakes,
      aiStory: p.ai.story,
      hinglishMnemonic: p.ai.hinglishMnemonic,
      englishMnemonic: p.ai.englishMnemonic,
      memoryTrick: p.ai.memoryTrick,
      visualMemoryPrompt: p.ai.visualMemoryPrompt,
      imagePrompt: p.ai.imagePrompt,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },

  toUpdateInput(word: Word): Prisma.WordUncheckedUpdateInput {
    const p = word.toJSON();
    return {
      word: p.word,
      slug: p.slug,
      pronunciation: p.pronunciation,
      ipa: p.ipa,
      difficulty: p.difficulty,
      frequency: p.frequency,
      partOfSpeech: p.partOfSpeech,
      meaning: p.meaning,
      hindiMeaning: p.hindiMeaning,
      synonyms: p.synonyms,
      antonyms: p.antonyms,
      rootWord: p.rootWord,
      prefix: p.prefix,
      suffix: p.suffix,
      etymology: p.etymology,
      exampleSentence: p.exampleSentence,
      commonMistakes: p.commonMistakes,
      aiStory: p.ai.story,
      hinglishMnemonic: p.ai.hinglishMnemonic,
      englishMnemonic: p.ai.englishMnemonic,
      memoryTrick: p.ai.memoryTrick,
      visualMemoryPrompt: p.ai.visualMemoryPrompt,
      imagePrompt: p.ai.imagePrompt,
      status: p.status,
      updatedAt: p.updatedAt,
    };
  },
};
