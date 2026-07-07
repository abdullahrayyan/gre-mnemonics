export {
  Difficulty,
  DIFFICULTIES,
  isDifficulty,
  PartOfSpeech,
  PARTS_OF_SPEECH,
  isPartOfSpeech,
  ExamType,
  EXAM_TYPES,
  isExamType,
  Language,
  LANGUAGES,
  WordStatus,
  WORD_STATUSES,
  MnemonicType,
  MNEMONIC_TYPES,
  ReviewRating,
  REVIEW_RATINGS,
} from './enums.js';

export { Word, EMPTY_AI_CONTENT } from './word.entity.js';
export type { WordProps, WordAiContent, CreateWordInput, UpdateWordInput } from './word.entity.js';

export type {
  WordRepository,
  WordSearchFilter,
  WordSort,
  WordSortField,
} from './word.repository.js';
