import type { Word, WordAiContent } from '@mnemonic/core';

/** JSON-serializable representation of a word returned by the API. */
export interface WordResponse {
  id: string;
  word: string;
  slug: string;
  pronunciation: string | null;
  ipa: string | null;
  difficulty: string;
  frequency: number | null;
  partOfSpeech: string;
  meaning: string;
  hindiMeaning: string | null;
  synonyms: string[];
  antonyms: string[];
  rootWord: string | null;
  prefix: string | null;
  suffix: string | null;
  etymology: string | null;
  exampleSentence: string | null;
  commonMistakes: string | null;
  ai: WordAiContent;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** Map a domain `Word` to its API response shape (dates as ISO strings). */
export function toWordResponse(word: Word): WordResponse {
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
    ai: p.ai,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
