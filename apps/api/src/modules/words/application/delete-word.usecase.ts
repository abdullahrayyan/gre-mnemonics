import { NotFoundError, type WordRepository } from '@mnemonic/core';

/** Delete a word (404 when it does not exist). */
export class DeleteWordUseCase {
  constructor(private readonly words: WordRepository) {}

  async execute(id: string): Promise<void> {
    const word = await this.words.findById(id);
    if (!word) throw new NotFoundError('Word', id);
    await this.words.delete(id);
  }
}
