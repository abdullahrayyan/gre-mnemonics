import { ConflictError, Word, type CreateWordInput, type WordRepository } from '@mnemonic/core';

/** Create a new word after enforcing spelling uniqueness. */
export class CreateWordUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly generateId: () => string,
  ) {}

  async execute(input: CreateWordInput): Promise<Word> {
    if (await this.words.existsByWord(input.word)) {
      throw new ConflictError(`A word already exists: "${input.word}"`);
    }
    const word = Word.create(input, { id: this.generateId() });
    return this.words.create(word);
  }
}
