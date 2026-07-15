/* eslint-disable no-console */
/**
 * Import a batch of hand-vetted mnemonics into `curated-mnemonics.json`.
 *
 *   node --import tsx apps/api/scripts/import-curated.ts <batch-file>
 *
 * The batch file is one word per line, pipe-delimited:
 *
 *   word | english meaning | hindi gloss | "Hook": sentence using the word
 *
 * Blank lines, `#` comments, and a markdown header/separator row are ignored, so
 * you can paste a markdown table straight in. Existing entries are overwritten,
 * others are left untouched (safe to re-run and to import batch after batch).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CuratedEntry } from '../src/container/curated-mnemonics.js';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(here, '../src/container/curated-mnemonics.json');

const batchFile = process.argv[2];
if (!batchFile) throw new Error('Usage: import-curated.ts <batch-file>');

const existing: Record<string, CuratedEntry> = existsSync(jsonPath)
  ? (JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, CuratedEntry>)
  : {};

const before = Object.keys(existing).length;
let added = 0;
let updated = 0;
const skipped: string[] = [];

for (const raw of readFileSync(batchFile, 'utf8').split(/\r?\n/)) {
  const line = raw.trim().replace(/^\|/, '').replace(/\|$/, '').trim();
  if (!line || line.startsWith('#')) continue;
  if (/^[\s|:-]+$/.test(line)) continue; // markdown separator row

  const cells = line.split('|').map((cell) => cell.trim());
  if (cells.length < 4) {
    skipped.push(raw.trim().slice(0, 60));
    continue;
  }
  const [word, meaning, hindiMeaning, ...rest] = cells;
  if (!word || !rest.join('|').trim()) {
    skipped.push(raw.trim().slice(0, 60));
    continue;
  }
  // Header row of a pasted table.
  if (/^word$/i.test(word)) continue;

  const key = word.toLowerCase();
  const entry: CuratedEntry = {
    ...(meaning ? { meaning } : {}),
    ...(hindiMeaning ? { hindiMeaning } : {}),
    mnemonic: rest.join('|').trim(),
  };
  if (existing[key]) updated += 1;
  else added += 1;
  existing[key] = entry;
}

// Keep the file stable + reviewable: alphabetical by word.
const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(jsonPath, `${JSON.stringify(sorted, null, 2)}\n`);

console.log(`curated: ${before} -> ${Object.keys(sorted).length} (added ${added}, updated ${updated})`);
if (skipped.length) {
  console.log(`skipped ${skipped.length} unparsable line(s):`);
  for (const line of skipped) console.log(`  - ${line}`);
}
