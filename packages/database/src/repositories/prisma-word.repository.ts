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
import type { Prisma, PrismaClient } from '@prisma/client';
import { WordMapper } from '../mappers/word.mapper.js';

/**
 * Prisma-backed implementation of the domain {@link WordRepository} port.
 * All query construction lives here so the application layer stays persistence-
 * agnostic. `search` runs the page query and the count in one transaction for a
 * consistent snapshot.
 */
export class PrismaWordRepository implements WordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Word | null> {
    const row = await this.prisma.word.findUnique({ where: { id } });
    return row ? WordMapper.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Word | null> {
    const row = await this.prisma.word.findUnique({ where: { slug } });
    return row ? WordMapper.toDomain(row) : null;
  }

  async findByWord(word: string): Promise<Word | null> {
    const row = await this.prisma.word.findFirst({
      where: { word: { equals: word, mode: 'insensitive' } },
    });
    return row ? WordMapper.toDomain(row) : null;
  }

  async search(filter: WordSearchFilter, page: PageRequest, sort?: WordSort): Promise<Page<Word>> {
    const where = this.buildWhere(filter);
    const orderBy = this.buildOrderBy(sort);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.word.findMany({
        where,
        orderBy,
        skip: pageOffset(page),
        take: page.pageSize,
      }),
      this.prisma.word.count({ where }),
    ]);

    return buildPage(rows.map(WordMapper.toDomain), total, page);
  }

  async create(word: Word): Promise<Word> {
    const row = await this.prisma.word.create({ data: WordMapper.toCreateInput(word) });
    return WordMapper.toDomain(row);
  }

  async update(word: Word): Promise<Word> {
    const row = await this.prisma.word.update({
      where: { id: word.id },
      data: WordMapper.toUpdateInput(word),
    });
    return WordMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.word.delete({ where: { id } });
  }

  async existsByWord(word: string): Promise<boolean> {
    const count = await this.prisma.word.count({
      where: { word: { equals: word, mode: 'insensitive' } },
    });
    return count > 0;
  }

  async countByExam(examType: ExamType): Promise<number> {
    return this.prisma.wordExam.count({ where: { exam: { type: examType } } });
  }

  private buildWhere(filter: WordSearchFilter): Prisma.WordWhereInput {
    const where: Prisma.WordWhereInput = {};

    if (filter.difficulty) where.difficulty = filter.difficulty;
    if (filter.partOfSpeech) where.partOfSpeech = filter.partOfSpeech;
    if (filter.status) where.status = filter.status;
    if (filter.examType) where.exams = { some: { exam: { type: filter.examType } } };

    if (filter.hasMnemonics === true) {
      where.hinglishMnemonic = { not: null };
      where.englishMnemonic = { not: null };
    } else if (filter.hasMnemonics === false) {
      where.OR = [{ hinglishMnemonic: null }, { englishMnemonic: null }];
    }

    const term = filter.term?.trim();
    if (term) {
      const contains: Prisma.StringFilter = { contains: term, mode: 'insensitive' };
      where.AND = [
        {
          OR: [
            { word: contains },
            { meaning: contains },
            { hindiMeaning: contains },
            { rootWord: contains },
            { synonyms: { has: term } },
          ],
        },
      ];
    }

    return where;
  }

  private buildOrderBy(sort?: WordSort): Prisma.WordOrderByWithRelationInput {
    if (!sort) return { createdAt: 'desc' };
    return { [sort.field]: sort.direction };
  }
}
