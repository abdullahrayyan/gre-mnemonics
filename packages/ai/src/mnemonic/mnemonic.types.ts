import { Difficulty, PartOfSpeech } from '@mnemonic/core';
import { z } from 'zod';

/** Quiz question kinds the engine may generate (mirrors DB `QuizQuestionType`). */
export const QUIZ_QUESTION_KINDS = [
  'WORD_TO_MEANING',
  'MEANING_TO_WORD',
  'SYNONYM',
  'ANTONYM',
  'SENTENCE_COMPLETION',
  'FILL_IN_BLANK',
  'ROOT',
  'MNEMONIC_RECALL',
] as const;
export type QuizQuestionKind = (typeof QUIZ_QUESTION_KINDS)[number];

// Normalize free-form model output ("word to meaning") into an enum member,
// falling back to a sensible default rather than failing the whole generation.
const quizKindSchema = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_')
      : value,
  z.enum(QUIZ_QUESTION_KINDS).catch('WORD_TO_MEANING'),
);

export const generatedQuizQuestionSchema = z.object({
  type: quizKindSchema,
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.string().min(1),
  explanation: z.string().default(''),
});
export type GeneratedQuizQuestion = z.infer<typeof generatedQuizQuestionSchema>;

/** The 11 artifacts produced for a word by the mnemonic engine. */
export const generatedMnemonicSetSchema = z.object({
  hinglishMnemonic: z.string().min(1),
  englishMnemonic: z.string().min(1),
  story: z.string().min(1),
  beginnerExplanation: z.string().min(1),
  hindiExplanation: z.string().min(1),
  rootExplanation: z.string().min(1),
  realLifeExample: z.string().min(1),
  visualImagination: z.string().min(1),
  memoryTrick: z.string().min(1),
  imagePrompt: z.string().min(1),
  quizQuestions: z.array(generatedQuizQuestionSchema).min(1).max(10),
});
export type GeneratedMnemonicSet = z.infer<typeof generatedMnemonicSetSchema>;

/** Input describing the word to generate learning content for. */
export interface MnemonicRequest {
  word: string;
  meaning?: string;
  partOfSpeech?: string;
  difficulty?: string;
  hindiMeaning?: string;
  examType?: string;
}

/**
 * A complete generated word entry: the lexical fields (definition, POS,
 * synonyms, …) plus all 11 mnemonic artifacts. Produced from just a word, so it
 * powers both corpus seeding and the "generate any word" feature.
 */
export const generatedWordSchema = generatedMnemonicSetSchema.extend({
  meaning: z.string().min(1),
  hindiMeaning: z.string().min(1),
  partOfSpeech: z.nativeEnum(PartOfSpeech).catch(PartOfSpeech.OTHER),
  difficulty: z.nativeEnum(Difficulty).catch(Difficulty.MEDIUM),
  synonyms: z.array(z.string().min(1)).max(20).default([]),
  antonyms: z.array(z.string().min(1)).max(20).default([]),
  rootWord: z.string().nullish(),
  exampleSentence: z.string().min(1),
});
export type GeneratedWord = z.infer<typeof generatedWordSchema>;
