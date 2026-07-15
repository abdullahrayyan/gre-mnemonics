import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Hand-vetted mnemonics that OVERRIDE the AI-generated corpus.
 *
 * The generator is inconsistent — it falls back to circular or gibberish hooks
 * ("Curmudge + On", "Greg + Gregarious", "Eph + Em + Eral"). Entries here are
 * reviewed by hand and always win, so quality never regresses when the corpus is
 * regenerated.
 *
 * The data lives in `curated-mnemonics.json` so batches can be appended with
 * `scripts/import-curated.ts` instead of hand-editing code. Keyed by lowercase word.
 *
 * Each entry is ONE reviewed hook + sentence, so a curated word shows a single
 * "Mnemonic" instead of the English/Hinglish pair.
 */
export interface CuratedEntry {
  meaning?: string;
  hindiMeaning?: string;
  /** The hook + the sentence that ties it to the meaning. */
  mnemonic: string;
}

function load(): Record<string, CuratedEntry> {
  const path = resolve(dirname(fileURLToPath(import.meta.url)), 'curated-mnemonics.json');
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, CuratedEntry>;
  } catch {
    return {};
  }
}

export const CURATED_MNEMONICS: Record<string, CuratedEntry> = load();
