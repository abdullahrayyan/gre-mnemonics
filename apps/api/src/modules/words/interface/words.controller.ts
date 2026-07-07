import type { WordSearchFilter, WordSort } from '@mnemonic/core';
import {
  createWordSchema,
  updateWordSchema,
  wordIdParamSchema,
  wordSearchQuerySchema,
  wordSlugParamSchema,
} from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type { WordUseCases } from '../../../container/container.js';
import { toWordResponse } from '../application/word.dto.js';

/**
 * HTTP controller for the words resource. Validates input with shared Zod
 * schemas (ZodErrors flow to the central error handler as 422) and delegates to
 * use-cases; it holds no business logic itself.
 */
export class WordsController {
  constructor(private readonly words: WordUseCases) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = wordSearchQuerySchema.parse(req.query);

    const filter: WordSearchFilter = {
      term: query.term,
      difficulty: query.difficulty,
      partOfSpeech: query.partOfSpeech,
      examType: query.examType,
      status: query.status,
      hasMnemonics: query.hasMnemonics,
    };
    const sort: WordSort | undefined = query.sort
      ? { field: query.sort, direction: query.order ?? 'asc' }
      : undefined;

    const page = await this.words.search.execute({
      filter,
      page: { page: query.page, pageSize: query.pageSize },
      sort,
    });

    res.status(200).json({
      data: page.items.map(toWordResponse),
      pagination: {
        page: page.page,
        pageSize: page.pageSize,
        total: page.total,
        totalPages: page.totalPages,
        hasNext: page.hasNext,
        hasPrevious: page.hasPrevious,
      },
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = createWordSchema.parse(req.body);
    const word = await this.words.create.execute(input);
    res.status(201).json({ data: toWordResponse(word) });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = wordIdParamSchema.parse(req.params);
    const word = await this.words.get.byId(id);
    res.status(200).json({ data: toWordResponse(word) });
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = wordSlugParamSchema.parse(req.params);
    const word = await this.words.get.bySlug(slug);
    res.status(200).json({ data: toWordResponse(word) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = wordIdParamSchema.parse(req.params);
    const patch = updateWordSchema.parse(req.body);
    const word = await this.words.update.execute(id, patch);
    res.status(200).json({ data: toWordResponse(word) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = wordIdParamSchema.parse(req.params);
    await this.words.remove.execute(id);
    res.status(204).send();
  };

  generate = async (req: Request, res: Response): Promise<void> => {
    const { id } = wordIdParamSchema.parse(req.params);
    const word = await this.words.generate.execute(id);
    res.status(200).json({ data: toWordResponse(word) });
  };
}
