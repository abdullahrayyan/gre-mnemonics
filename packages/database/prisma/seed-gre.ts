/* eslint-disable no-console */
/**
 * Seed the GRE vocabulary corpus (gregmat groups). Creates the GRE exam and one
 * WordCategory per group, then — when OPENAI_API_KEY is set — generates a full
 * entry per word (meaning, Hindi, mnemonics, quizzes) via the AI engine and
 * upserts it. Idempotent and resumable: words that already have a mnemonic are
 * skipped, so you can re-run to continue after interruption.
 *
 *   OPENAI_API_KEY=... DATABASE_URL=... pnpm db:seed:gre
 */
import { randomUUID } from 'node:crypto';
import { MnemonicEngine, OpenAiProvider } from '@mnemonic/ai';
import { ExamType, slugify, Word } from '@mnemonic/core';
import { type Prisma, PrismaClient } from '@prisma/client';
import { WordMapper } from '../src/mappers/word.mapper.js';
import { GRE_GROUPS, GRE_WORDS } from './data/gre-vocabulary.js';

const prisma = new PrismaClient();
const CONCURRENCY = 5;

async function ensureGreExam(): Promise<string> {
  const exam = await prisma.exam.upsert({
    where: { type: ExamType.GRE },
    update: {},
    create: {
      type: ExamType.GRE,
      name: 'GRE',
      slug: 'gre',
      description: 'Graduate Record Examinations',
    },
  });
  return exam.id;
}

async function ensureGroupCategories(greExamId: string): Promise<Map<number, string>> {
  const byGroup = new Map<number, string>();
  for (const group of GRE_GROUPS) {
    const slug = `gre-group-${group.group}`;
    const category = await prisma.wordCategory.upsert({
      where: { slug },
      update: { examId: greExamId },
      create: { name: `GRE Group ${group.group}`, slug, examId: greExamId },
    });
    byGroup.set(group.group, category.id);
  }
  return byGroup;
}

function groupsForWord(word: string): number[] {
  return GRE_GROUPS.filter((g) => g.words.includes(word)).map((g) => g.group);
}

async function linkAssociations(
  wordId: string,
  greExamId: string,
  categoryByGroup: Map<number, string>,
  word: string,
): Promise<void> {
  await prisma.wordExam.upsert({
    where: { wordId_examId: { wordId, examId: greExamId } },
    update: {},
    create: { wordId, examId: greExamId },
  });
  for (const groupNumber of groupsForWord(word)) {
    const categoryId = categoryByGroup.get(groupNumber);
    if (!categoryId) continue;
    await prisma.wordCategoryOnWord.upsert({
      where: { wordId_categoryId: { wordId, categoryId } },
      update: {},
      create: { wordId, categoryId },
    });
  }
}

type WordOutcome = 'created' | 'skipped' | 'failed';

async function seedWord(
  engine: MnemonicEngine,
  greExamId: string,
  categoryByGroup: Map<number, string>,
  word: string,
): Promise<WordOutcome> {
  const slug = slugify(word);
  const existing = await prisma.word.findUnique({ where: { slug } });
  if (existing?.hinglishMnemonic) {
    await linkAssociations(existing.id, greExamId, categoryByGroup, word);
    return 'skipped';
  }

  try {
    const result = await engine.generateWord(word, { examType: 'GRE' });
    const entity = Word.create(engine.toCreateWordInput(word, result.data), {
      id: existing?.id ?? randomUUID(),
    });
    const row = await prisma.word.upsert({
      where: { slug },
      create: WordMapper.toCreateInput(entity),
      update: WordMapper.toUpdateInput(entity),
    });

    await prisma.aiHistory.create({
      data: {
        wordId: row.id,
        type: 'MNEMONIC_SET' as Prisma.AiHistoryUncheckedCreateInput['type'],
        model: result.model,
        prompt: `word:${word}`,
        response: result.data as unknown as Prisma.InputJsonValue,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        latencyMs: result.usage.latencyMs,
        status: 'SUCCESS' as Prisma.AiHistoryUncheckedCreateInput['status'],
      },
    });

    await linkAssociations(row.id, greExamId, categoryByGroup, word);
    return 'created';
  } catch (error) {
    console.error(`  ✗ ${word}: ${(error as Error).message}`);
    return 'failed';
  }
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index]!);
    }
  });
  await Promise.all(runners);
}

async function main(): Promise<void> {
  console.log(`Seeding GRE corpus: ${GRE_GROUPS.length} groups, ${GRE_WORDS.length} unique words`);
  const greExamId = await ensureGreExam();
  const categoryByGroup = await ensureGroupCategories(greExamId);
  console.log(`✓ GRE exam + ${categoryByGroup.size} group categories`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log(
      `OPENAI_API_KEY not set — group categories seeded. Set OPENAI_API_KEY and re-run to generate content for ${GRE_WORDS.length} words.`,
    );
    return;
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const engine = new MnemonicEngine(new OpenAiProvider({ apiKey, defaultModel: model }), { model });

  const counts = { created: 0, skipped: 0, failed: 0 };
  await runPool(GRE_WORDS, async (word) => {
    const outcome = await seedWord(engine, greExamId, categoryByGroup, word);
    counts[outcome] += 1;
    if (outcome === 'created') console.log(`  ✓ ${word} (${counts.created}/${GRE_WORDS.length})`);
  });

  console.log(`Done. created=${counts.created} skipped=${counts.skipped} failed=${counts.failed}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('GRE seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
