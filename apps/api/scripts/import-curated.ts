/* eslint-disable no-console */
/**
 * Import a batch of hand-vetted mnemonics into `curated-mnemonics.json`.
 *
 *   node --import tsx apps/api/scripts/import-curated.ts <batch-file>
 *
 * One word per line, pipe-delimited, in either shape:
 *
 *   word | english meaning | hindi gloss | "Hook": sentence using the word
 *   word | english meaning (hindi gloss) | "Hook": sentence using the word
 *
 * The 3-column shape is what Gemini emits, with the Hindi tucked into a trailing
 * parenthetical; it is split back out here. Markdown `**bold**`/`*italic*` markers
 * are stripped, so a copied table can be pasted in untouched. Blank lines, `#`
 * comments, and header/separator rows are ignored. Existing entries are
 * overwritten and others left alone, so this is safe to re-run batch after batch.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CuratedEntry } from '../src/container/curated-mnemonics.js';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(here, '../src/container/curated-mnemonics.json');
const corpusPath = resolve(here, '../src/container/demo-corpus.json');

const batchFile = process.argv[2];
if (!batchFile) throw new Error('Usage: import-curated.ts <batch-file>');

const existing: Record<string, CuratedEntry> = existsSync(jsonPath)
  ? (JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, CuratedEntry>)
  : {};

// Curated entries are looked up BY corpus word when words.json is built, so an
// entry whose headword is not in the corpus can never reach the app. Reject
// those on the way in — otherwise a misspelled headword imports "successfully"
// and silently goes missing, which is far harder to notice than a failed row.
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as { word: string }[];
const known = new Set(corpus.map((entry) => entry.word.toLowerCase()));

const before = Object.keys(existing).length;
let added = 0;
let updated = 0;
const skipped: string[] = [];
const unknown: string[] = [];

/**
 * Drop Gemini's `[cite: n]` markers and markdown emphasis, then collapse the
 * whitespace they leave behind. Cites go first so a gloss still ends the cell.
 */
const clean = (cell: string) =>
  cell
    .replace(/\[cite:[^\]]*\]/gi, '')
    .replace(/\*+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull a trailing "(hindi gloss)" off an English meaning. Anchored to the end so
 * a meaning with its own aside — "enjoyable (of an atmosphere or event) (Milansar)"
 * — keeps the aside and yields only the last group as the gloss.
 */
const splitGloss = (meaning: string): [string, string] => {
  const match = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(meaning);
  return match?.[1] && match[2] ? [match[1].trim(), match[2].trim()] : [meaning, ''];
};

for (const raw of readFileSync(batchFile, 'utf8').split(/\r?\n/)) {
  const line = raw.trim().replace(/^\|/, '').replace(/\|$/, '').trim();
  if (!line || line.startsWith('#')) continue;
  if (/^[\s|:-]+$/.test(line)) continue; // markdown separator row

  const cells = line.split('|').map(clean);
  const word = cells[0];
  if (!word || /^word$/i.test(word)) continue; // header row of a pasted table

  // 3 columns is Gemini's shape (gloss inside the meaning); 4+ is the explicit
  // shape, where any extra pipes belong to the mnemonic sentence.
  let meaning = cells[1] ?? '';
  let hindiMeaning = '';
  let mnemonic = '';
  if (cells.length === 3) {
    [meaning, hindiMeaning] = splitGloss(meaning);
    mnemonic = cells[2] ?? '';
  } else if (cells.length >= 4) {
    hindiMeaning = cells[2] ?? '';
    mnemonic = cells.slice(3).join(' | ').trim();
  }

  if (!meaning || !mnemonic) {
    skipped.push(raw.trim().slice(0, 60));
    continue;
  }

  const key = word.toLowerCase();
  if (!known.has(key)) {
    unknown.push(word);
    continue;
  }
  const entry: CuratedEntry = {
    meaning,
    ...(hindiMeaning ? { hindiMeaning } : {}),
    mnemonic,
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
if (unknown.length) {
  console.log(`\nREJECTED ${unknown.length} word(s) not in the corpus — fix the spelling and re-run:`);
  for (const word of unknown) console.log(`  - ${word}`);
}
