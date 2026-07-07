import {
  normalizePageRequest,
  type Page,
  type PageRequest,
  type Word,
  type WordRepository,
  type WordSearchFilter,
  type WordSort,
} from '@mnemonic/core';

export interface SearchWordsParams {
  filter: WordSearchFilter;
  page?: Partial<PageRequest>;
  sort?: WordSort;
}

/** Search/list words with filtering, sorting, and safe pagination. */
export class SearchWordsUseCase {
  constructor(private readonly words: WordRepository) {}

  async execute(params: SearchWordsParams): Promise<Page<Word>> {
    const page = normalizePageRequest(params.page);
    return this.words.search(params.filter, page, params.sort);
  }
}
