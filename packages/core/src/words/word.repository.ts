import type { Page, PageRequest, SortDirection } from '../shared/pagination.js';
import type { Difficulty, ExamType, PartOfSpeech, WordStatus } from './enums.js';
import type { Word } from './word.entity.js';

/** Filter criteria for searching the word catalog. All fields are optional. */
export interface WordSearchFilter {
  /** Free-text term matched against word, meaning, Hindi meaning, synonyms, root. */
  term?: string;
  difficulty?: Difficulty;
  partOfSpeech?: PartOfSpeech;
  examType?: ExamType;
  status?: WordStatus;
  /** When true, only words that already have complete mnemonics. */
  hasMnemonics?: boolean;
}

export type WordSortField = 'word' | 'difficulty' | 'frequency' | 'createdAt' | 'updatedAt';

export interface WordSort {
  field: WordSortField;
  direction: SortDirection;
}

/**
 * Persistence port for the Word aggregate (Repository Pattern). The domain
 * owns this interface; infrastructure (Prisma) provides the implementation, so
 * use-cases depend on the abstraction, not the database.
 */
export interface WordRepository {
  findById(id: string): Promise<Word | null>;
  findBySlug(slug: string): Promise<Word | null>;
  findByWord(word: string): Promise<Word | null>;
  search(filter: WordSearchFilter, page: PageRequest, sort?: WordSort): Promise<Page<Word>>;
  create(word: Word): Promise<Word>;
  update(word: Word): Promise<Word>;
  delete(id: string): Promise<void>;
  existsByWord(word: string): Promise<boolean>;
  countByExam(examType: ExamType): Promise<number>;
}
