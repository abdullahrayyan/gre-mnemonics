import {
  ConflictError,
  Difficulty,
  NotFoundError,
  PartOfSpeech,
  type CreateWordInput,
} from '@mnemonic/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateWordUseCase } from './application/create-word.usecase.js';
import { DeleteWordUseCase } from './application/delete-word.usecase.js';
import { GetWordUseCase } from './application/get-word.usecase.js';
import { SearchWordsUseCase } from './application/search-words.usecase.js';
import { UpdateWordUseCase } from './application/update-word.usecase.js';
import { InMemoryWordRepository } from './infrastructure/in-memory-word.repository.js';

const makeInput = (over: Partial<CreateWordInput> = {}): CreateWordInput => ({
  word: 'Bolster',
  difficulty: Difficulty.MEDIUM,
  partOfSpeech: PartOfSpeech.VERB,
  meaning: 'to support or strengthen',
  ...over,
});

describe('word use-cases', () => {
  let repo: InMemoryWordRepository;
  let create: CreateWordUseCase;
  let get: GetWordUseCase;
  let search: SearchWordsUseCase;
  let update: UpdateWordUseCase;
  let remove: DeleteWordUseCase;
  let seq = 0;

  beforeEach(() => {
    seq = 0;
    repo = new InMemoryWordRepository();
    const generateId = (): string => `word_${(seq += 1)}`;
    create = new CreateWordUseCase(repo, generateId);
    get = new GetWordUseCase(repo);
    search = new SearchWordsUseCase(repo);
    update = new UpdateWordUseCase(repo);
    remove = new DeleteWordUseCase(repo);
  });

  it('creates and fetches a word (deriving the slug)', async () => {
    const created = await create.execute(makeInput());
    expect(created.slug).toBe('bolster');
    const fetched = await get.byId(created.id);
    expect(fetched.word).toBe('Bolster');
  });

  it('rejects a duplicate word', async () => {
    await create.execute(makeInput());
    await expect(create.execute(makeInput())).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFound for a missing id', async () => {
    await expect(get.byId('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('applies a partial update', async () => {
    const created = await create.execute(makeInput());
    const updated = await update.execute(created.id, {
      meaning: 'to prop up',
      difficulty: Difficulty.HARD,
    });
    expect(updated.meaning).toBe('to prop up');
    expect(updated.difficulty).toBe(Difficulty.HARD);
  });

  it('deletes a word', async () => {
    const created = await create.execute(makeInput());
    await remove.execute(created.id);
    await expect(get.byId(created.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('searches by term and by difficulty', async () => {
    await create.execute(makeInput({ word: 'Bolster', meaning: 'support' }));
    await create.execute(
      makeInput({
        word: 'Ephemeral',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        difficulty: Difficulty.HARD,
        meaning: 'short-lived',
      }),
    );

    const byTerm = await search.execute({ filter: { term: 'short' } });
    expect(byTerm.total).toBe(1);
    expect(byTerm.items[0]!.word).toBe('Ephemeral');

    const byDifficulty = await search.execute({ filter: { difficulty: Difficulty.HARD } });
    expect(byDifficulty.total).toBe(1);

    const all = await search.execute({ filter: {} });
    expect(all.total).toBe(2);
  });

  it('paginates results', async () => {
    for (let i = 0; i < 5; i += 1) {
      await create.execute(makeInput({ word: `Word${i}`, meaning: `meaning ${i}` }));
    }
    const page = await search.execute({ filter: {}, page: { page: 1, pageSize: 2 } });
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(5);
    expect(page.totalPages).toBe(3);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(false);
  });
});
