import {
  Word,
  type ExamType,
  type Page,
  type PageRequest,
  type WordProps,
  type WordRepository,
  type WordSearchFilter,
  type WordSort,
} from '@mnemonic/core';
import type { CacheStore } from '../../../shared/cache/cache-store.js';

const DEFAULT_TTL_SECONDS = 300;

/**
 * Caching decorator over a {@link WordRepository}. Caches single-word lookups
 * (by id and slug) and invalidates on write. Search and existence checks are
 * passed through (their result sets change too often to cache safely here).
 */
export class CachedWordRepository implements WordRepository {
  constructor(
    private readonly inner: WordRepository,
    private readonly cache: CacheStore,
    private readonly ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ) {}

  async findById(id: string): Promise<Word | null> {
    const key = idKey(id);
    const cached = await this.cache.get(key);
    if (cached) return deserialize(cached);

    const word = await this.inner.findById(id);
    if (word) await this.cache.set(key, serialize(word), this.ttlSeconds);
    return word;
  }

  async findBySlug(slug: string): Promise<Word | null> {
    const key = slugKey(slug);
    const cached = await this.cache.get(key);
    if (cached) return deserialize(cached);

    const word = await this.inner.findBySlug(slug);
    if (word) await this.cache.set(key, serialize(word), this.ttlSeconds);
    return word;
  }

  async findByWord(word: string): Promise<Word | null> {
    return this.inner.findByWord(word);
  }

  async search(filter: WordSearchFilter, page: PageRequest, sort?: WordSort): Promise<Page<Word>> {
    return this.inner.search(filter, page, sort);
  }

  async create(word: Word): Promise<Word> {
    const saved = await this.inner.create(word);
    await this.invalidate(saved);
    return saved;
  }

  async update(word: Word): Promise<Word> {
    const saved = await this.inner.update(word);
    await this.invalidate(saved);
    return saved;
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    await this.cache.del(idKey(id));
  }

  async existsByWord(word: string): Promise<boolean> {
    return this.inner.existsByWord(word);
  }

  async countByExam(examType: ExamType): Promise<number> {
    return this.inner.countByExam(examType);
  }

  private async invalidate(word: Word): Promise<void> {
    await this.cache.del(idKey(word.id));
    await this.cache.del(slugKey(word.slug));
  }
}

const idKey = (id: string): string => `word:id:${id}`;
const slugKey = (slug: string): string => `word:slug:${slug}`;

function serialize(word: Word): string {
  return JSON.stringify(word.toJSON());
}

function deserialize(raw: string): Word {
  const parsed = JSON.parse(raw) as WordProps;
  return Word.reconstitute({
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt),
  });
}
