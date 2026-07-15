/* eslint-disable no-console */
/**
 * Merges the word corpus with the curated (hand-checked) mnemonics and writes
 * the single JSON file the web app ships with.
 *
 * Run this after every `import-curated.mjs` run — the web app reads words.json
 * directly, so an import alone changes nothing that a user can see.
 *
 *   node scripts/build-words.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));

const corpus = read(join(here, '../data/corpus.json'));
const curated = read(join(here, '../data/curated.json'));
const out = join(here, '../apps/web/src/data/words.json');

const words = corpus
  .map((entry) => {
    const pick = curated[entry.word.toLowerCase()];
    return {
      word: entry.word,
      pos: (entry.partOfSpeech ?? '').toLowerCase(),
      meaning: pick?.meaning ?? entry.meaning,
      hindi: pick?.hindiMeaning ?? entry.hindiMeaning ?? '',
      mnemonic: pick?.mnemonic ?? entry.ai?.englishMnemonic ?? '',
      // Curated entries carry their sentence inside the mnemonic already, so the
      // generated Hinglish line would only repeat a worse version of it.
      hinglish: pick ? '' : (entry.ai?.hinglishMnemonic ?? ''),
      curated: Boolean(pick),
    };
  })
  .sort((a, b) => a.word.localeCompare(b.word));

writeFileSync(out, JSON.stringify(words));

const curatedCount = words.filter((word) => word.curated).length;
console.log(`words.json: ${words.length} words (${curatedCount} curated)`);
