import { Difficulty, ExamType, PartOfSpeech, WordStatus } from '@mnemonic/core';
import { z } from 'zod';

const nullableString = z.string().trim().max(5000).nullish();

/** Body schema for creating a word. Mirrors the domain `CreateWordInput`. */
export const createWordSchema = z.object({
  word: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(140).optional(),
  difficulty: z.nativeEnum(Difficulty),
  partOfSpeech: z.nativeEnum(PartOfSpeech),
  meaning: z.string().trim().min(1).max(2000),
  pronunciation: nullableString,
  ipa: nullableString,
  frequency: z.number().int().nonnegative().nullish(),
  hindiMeaning: nullableString,
  synonyms: z.array(z.string().trim().min(1)).max(50).optional(),
  antonyms: z.array(z.string().trim().min(1)).max(50).optional(),
  rootWord: nullableString,
  prefix: nullableString,
  suffix: nullableString,
  etymology: nullableString,
  exampleSentence: nullableString,
  commonMistakes: nullableString,
  status: z.nativeEnum(WordStatus).optional(),
});
export type CreateWordDto = z.infer<typeof createWordSchema>;

/** Body schema for partial updates (at least one field required). */
export const updateWordSchema = createWordSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateWordDto = z.infer<typeof updateWordSchema>;

const boolFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

/** Query schema for searching/listing words (coerces querystring values). */
export const wordSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  term: z.string().trim().min(1).max(200).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  partOfSpeech: z.nativeEnum(PartOfSpeech).optional(),
  examType: z.nativeEnum(ExamType).optional(),
  status: z.nativeEnum(WordStatus).optional(),
  hasMnemonics: boolFromString.optional(),
  sort: z.enum(['word', 'difficulty', 'frequency', 'createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
export type WordSearchQueryDto = z.infer<typeof wordSearchQuerySchema>;

export const wordIdParamSchema = z.object({ id: z.string().trim().min(1) });
export const wordSlugParamSchema = z.object({ slug: z.string().trim().min(1) });
