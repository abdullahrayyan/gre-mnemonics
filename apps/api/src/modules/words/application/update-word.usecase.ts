import {
  NotFoundError,
  type UpdateWordInput,
  type Word,
  type WordRepository,
} from '@mnemonic/core';

/** Apply a validated partial update to an existing word. */
export class UpdateWordUseCase {
  constructor(private readonly words: WordRepository) {}

  async execute(id: string, patch: UpdateWordInput): Promise<Word> {
    const word = await this.words.findById(id);
    if (!word) throw new NotFoundError('Word', id);
    word.update(patch);
    return this.words.update(word);
  }
}
