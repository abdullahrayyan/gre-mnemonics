/**
 * @mnemonic/validation — Zod schemas shared between the API and the web client,
 * so both validate identically. Depends only on the domain for enum sources.
 */
export {
  createWordSchema,
  updateWordSchema,
  wordSearchQuerySchema,
  wordIdParamSchema,
  wordSlugParamSchema,
} from './words.js';
export type { CreateWordDto, UpdateWordDto, WordSearchQueryDto } from './words.js';
