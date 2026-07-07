// Combining diacritical marks (U+0300–U+036F), removed after NFKD normalization.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

/**
 * Deterministic, URL-safe slug from arbitrary text. Lowercases, strips
 * diacritics, and collapses non-alphanumerics to single hyphens.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
