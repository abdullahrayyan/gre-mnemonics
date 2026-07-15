/* eslint-disable no-console */
/**
 * Writes remaining-groups.md at the repo root: the words still using generated
 * mnemonics, grouped exactly as the app groups them, ready to paste into Gemini.
 *
 * Run after build-words.mjs so the list reflects the latest import.
 *
 *   node scripts/build-remaining.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Must match GROUP_SIZE in apps/web/src/lib/words.ts.
const GROUP_SIZE = 25;

const words = JSON.parse(readFileSync(join(root, 'apps/web/src/data/words.json'), 'utf8'));
const curated = words.filter((word) => word.curated).length;

const lines = [
  '# Remaining groups to curate',
  '',
  'Words still using the generated (weaker) AI mnemonics, listed group by group.',
  'Copy a group into Gemini, paste the result back, and it gets imported.',
  '',
  `Curated: ${curated} / ${words.length} words. Remaining: ${words.length - curated}.`,
  '',
  'Regenerate this file with:',
  '',
  '    node apps/api/scripts/build-remaining.mjs',
  '',
];

for (let group = 1; group * GROUP_SIZE - GROUP_SIZE < words.length; group += 1) {
  const todo = words
    .slice((group - 1) * GROUP_SIZE, group * GROUP_SIZE)
    .filter((word) => !word.curated);
  if (!todo.length) continue;
  lines.push(`## Group ${group} (${todo.length})`, '', todo.map((w) => w.word).join(', '), '');
}

writeFileSync(join(root, 'remaining-groups.md'), `${lines.join('\n')}\n`);
console.log(`remaining-groups.md: ${words.length - curated} words left to curate`);
