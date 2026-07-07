import {
  buildPage,
  pageOffset,
  type ExamType,
  type Page,
  type PageRequest,
  type Word,
  type WordRepository,
  type WordSearchFilter,
  type WordSort,
} from '@mnemonic/core';

/**
 * In-memory {@link WordRepository} for tests and offline development. Mirrors the
 * Prisma implementation's filtering/sorting semantics closely enough to exercise
 * the use-cases and HTTP layer without a database. Exam-scoped queries are not
 * modeled here.
 */
export class InMemoryWordRepository implements WordRepository {
  private readonly byId = new Map<string, Word>();

  async findById(id: string): Promise<Word | null> {
    return this.byId.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Word | null> {
    for (const word of this.byId.values()) {
      if (word.slug === slug) return word;
    }
    return null;
  }

  async findByWord(word: string): Promise<Word | null> {
    const target = word.toLowerCase();
    for (const candidate of this.byId.values()) {
      if (candidate.word.toLowerCase() === target) return candidate;
    }
    return null;
  }

  async search(filter: WordSearchFilter, page: PageRequest, sort?: WordSort): Promise<Page<Word>> {
    const matched = [...this.byId.values()].filter((word) => this.matches(word, filter));
    const sorted = this.sortWords(matched, sort);
    const start = pageOffset(page);
    const items = sorted.slice(start, start + page.pageSize);
    return buildPage(items, matched.length, page);
  }

  async create(word: Word): Promise<Word> {
    this.byId.set(word.id, word);
    return word;
  }

  async update(word: Word): Promise<Word> {
    this.byId.set(word.id, word);
    return word;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }

  async existsByWord(word: string): Promise<boolean> {
    return (await this.findByWord(word)) !== null;
  }

  async countByExam(_examType: ExamType): Promise<number> {
    return 0;
  }

  private matches(word: Word, filter: WordSearchFilter): boolean {
    const props = word.toJSON();

    if (filter.difficulty && props.difficulty !== filter.difficulty) return false;
    if (filter.partOfSpeech && props.partOfSpeech !== filter.partOfSpeech) return false;
    if (filter.status && props.status !== filter.status) return false;

    if (filter.hasMnemonics === true && !word.hasCompleteMnemonics()) return false;
    if (filter.hasMnemonics === false && word.hasCompleteMnemonics()) return false;

    if (filter.term) {
      const term = filter.term.toLowerCase();
      const haystack = [
        props.word,
        props.meaning,
        props.hindiMeaning ?? '',
        props.rootWord ?? '',
        ...props.synonyms,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  }

  private sortWords(words: Word[], sort?: WordSort): Word[] {
    if (!sort) {
      return [...words].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...words].sort(
      (a, b) => compareValues(sortValue(a, sort.field), sortValue(b, sort.field)) * dir,
    );
  }
}

function sortValue(word: Word, field: WordSort['field']): number | string {
  const props = word.toJSON();
  switch (field) {
    case 'frequency':
      return props.frequency ?? -1;
    case 'createdAt':
      return props.createdAt.getTime();
    case 'updatedAt':
      return props.updatedAt.getTime();
    case 'word':
      return props.word.toLowerCase();
    case 'difficulty':
      return props.difficulty;
  }
}

function compareValues(a: number | string, b: number | string): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}
