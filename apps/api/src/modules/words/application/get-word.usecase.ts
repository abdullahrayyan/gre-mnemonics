import { NotFoundError, type Word, type WordRepository } from '@mnemonic/core';

/** Fetch a single word by id or slug (404 when absent). */
export class GetWordUseCase {
  constructor(private readonly words: WordRepository) {}

  async byId(id: string): Promise<Word> {
    const word = await this.words.findById(id);
    if (!word) throw new NotFoundError('Word', id);
    return word;
  }

  async bySlug(slug: string): Promise<Word> {
    const word = await this.words.findBySlug(slug);
    if (!word) throw new NotFoundError('Word', slug);
    return word;
  }
}
