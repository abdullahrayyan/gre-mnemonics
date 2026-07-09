/* eslint-disable no-console */
/**
 * Generate full learning content (meaning, Hindi, synonyms, mnemonics, …) for
 * the entire GRE corpus using OpenAI, and cache it to a JSON file the in-memory
 * demo loads at boot. Idempotent + resumable: existing entries are kept and
 * skipped, so you can re-run to fill gaps after an interruption or rate-limit.
 *
 *   node --import tsx apps/api/scripts/generate-demo-corpus.ts [limit]
 *
 * Reads OPENAI_API_KEY / OPENAI_MODEL from apps/api/.env.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MnemonicEngine, OpenAiProvider } from '@mnemonic/ai';
import type { CreateWordInput } from '@mnemonic/core';
import { config as loadEnv } from 'dotenv';
import { GRE_WORDS } from '../../../packages/database/prisma/data/gre-vocabulary.js';

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '../.env') });

const OUT_PATH = resolve(here, '../src/container/demo-corpus.json');
const CONCURRENCY = 6;
const WRITE_EVERY = 20;

type Entry = CreateWordInput & { word: string };

function load(): Map<string, Entry> {
  if (!existsSync(OUT_PATH)) return new Map();
  const rows = JSON.parse(readFileSync(OUT_PATH, 'utf8')) as Entry[];
  return new Map(rows.map((row) => [row.word.toLowerCase(), row]));
}

function save(map: Map<string, Entry>): void {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  // Preserve corpus order for a stable, predictable demo list.
  const ordered = GRE_WORDS.map((w) => map.get(w.toLowerCase())).filter(Boolean);
  writeFileSync(OUT_PATH, `${JSON.stringify(ordered, null, 0)}\n`);
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set (expected in apps/api/.env)');
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const engine = new MnemonicEngine(new OpenAiProvider({ apiKey, defaultModel: model }), { model });

  const limit = process.argv[2] ? Number(process.argv[2]) : GRE_WORDS.length;
  const done = load();
  const todo = GRE_WORDS.slice(0, limit).filter((w) => !done.has(w.toLowerCase()));
  console.log(
    `Corpus ${GRE_WORDS.length} words · cached ${done.size} · generating ${todo.length} (model ${model}, concurrency ${CONCURRENCY})`,
  );

  let completed = 0;
  let failed = 0;
  let cursor = 0;
  let sinceWrite = 0;

  const runners = Array.from({ length: Math.min(CONCURRENCY, todo.length) }, async () => {
    while (cursor < todo.length) {
      const word = todo[cursor++]!;
      try {
        const result = await engine.generateWord(word, { examType: 'GRE' });
        const input = engine.toCreateWordInput(word, result.data);
        done.set(word.toLowerCase(), { ...input, word });
        completed += 1;
        sinceWrite += 1;
        if (completed % 10 === 0 || completed === todo.length) {
          console.log(`  ✓ ${completed}/${todo.length} (${word})`);
        }
        if (sinceWrite >= WRITE_EVERY) {
          sinceWrite = 0;
          save(done);
        }
      } catch (error) {
        failed += 1;
        console.error(`  ✗ ${word}: ${(error as Error).message}`);
      }
    }
  });

  await Promise.all(runners);
  save(done);
  console.log(`Done. total cached=${done.size} newly generated=${completed} failed=${failed}`);
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((error) => {
  console.error('generate-demo-corpus failed:', error);
  process.exit(1);
});
