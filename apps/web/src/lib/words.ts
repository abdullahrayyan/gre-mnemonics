import data from '@/data/words.json';

export interface Word {
  word: string;
  pos: string;
  meaning: string;
  hindi: string;
  /** The memory hook + sentence. */
  mnemonic: string;
  /** Hinglish variant (AI-generated words only; curated words carry one hook). */
  hinglish: string;
  curated: boolean;
}

export const WORDS = data as Word[];
export const GROUP_SIZE = 25;
export const GROUP_COUNT = Math.ceil(WORDS.length / GROUP_SIZE);

/** The 25 words of a 1-based group number. */
export function groupWords(group: number): Word[] {
  return WORDS.slice((group - 1) * GROUP_SIZE, group * GROUP_SIZE);
}

export interface GroupSummary {
  group: number;
  from: string;
  to: string;
  count: number;
}

/** Lightweight summaries for the group index (no word payloads). */
export function groupSummaries(): GroupSummary[] {
  return Array.from({ length: GROUP_COUNT }, (_, index) => {
    const words = groupWords(index + 1);
    return {
      group: index + 1,
      from: words[0]?.word ?? '',
      to: words[words.length - 1]?.word ?? '',
      count: words.length,
    };
  });
}
