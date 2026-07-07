import { Guard } from '../shared/guard.js';
import { slugify } from '../shared/slug.js';
import {
  DIFFICULTIES,
  PARTS_OF_SPEECH,
  WORD_STATUSES,
  WordStatus,
  type Difficulty,
  type PartOfSpeech,
} from './enums.js';

/** AI-generated learning content for a word (produced by the Phase 2 engine). */
export interface WordAiContent {
  story: string | null;
  hinglishMnemonic: string | null;
  englishMnemonic: string | null;
  memoryTrick: string | null;
  visualMemoryPrompt: string | null;
  imagePrompt: string | null;
}

export const EMPTY_AI_CONTENT: WordAiContent = {
  story: null,
  hinglishMnemonic: null,
  englishMnemonic: null,
  memoryTrick: null,
  visualMemoryPrompt: null,
  imagePrompt: null,
};

/** Full persisted shape of a word (what the repository reconstitutes from). */
export interface WordProps {
  id: string;
  word: string;
  slug: string;
  pronunciation: string | null;
  ipa: string | null;
  difficulty: Difficulty;
  frequency: number | null;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  hindiMeaning: string | null;
  synonyms: string[];
  antonyms: string[];
  rootWord: string | null;
  prefix: string | null;
  suffix: string | null;
  etymology: string | null;
  exampleSentence: string | null;
  commonMistakes: string | null;
  ai: WordAiContent;
  status: WordStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Input accepted when creating a new word (id/timestamps assigned by create). */
export interface CreateWordInput {
  word: string;
  slug?: string;
  pronunciation?: string | null;
  ipa?: string | null;
  difficulty: Difficulty;
  frequency?: number | null;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  hindiMeaning?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  rootWord?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  etymology?: string | null;
  exampleSentence?: string | null;
  commonMistakes?: string | null;
  ai?: Partial<WordAiContent>;
  status?: WordStatus;
}

/** Fields that may be changed on an existing word (partial update). */
export interface UpdateWordInput {
  word?: string;
  slug?: string;
  pronunciation?: string | null;
  ipa?: string | null;
  difficulty?: Difficulty;
  frequency?: number | null;
  partOfSpeech?: PartOfSpeech;
  meaning?: string;
  hindiMeaning?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  rootWord?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  etymology?: string | null;
  exampleSentence?: string | null;
  commonMistakes?: string | null;
  status?: WordStatus;
}

const MAX_WORD_LENGTH = 100;
const MAX_MEANING_LENGTH = 2000;

function normalizeList(values: readonly string[] | undefined): string[] {
  if (!values) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (value.length === 0) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function nullableTrim(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * The Word aggregate root — the core vocabulary entity. Guards its own
 * invariants: it can only be constructed valid. Persistence hydrates instances
 * via {@link Word.reconstitute}; new words are built via {@link Word.create}.
 */
export class Word {
  private constructor(private props: WordProps) {}

  /** Build and validate a brand-new word. Throws `ValidationError` if invalid. */
  static create(input: CreateWordInput, options: { id: string; now?: Date }): Word {
    const now = options.now ?? new Date();
    const word = input.word?.trim() ?? '';
    const meaning = input.meaning?.trim() ?? '';

    new Guard()
      .requireNonEmpty(word, 'word')
      .requireMaxLength(word, MAX_WORD_LENGTH, 'word')
      .requireNonEmpty(meaning, 'meaning')
      .requireMaxLength(meaning, MAX_MEANING_LENGTH, 'meaning')
      .requireOneOf(input.difficulty, DIFFICULTIES, 'difficulty')
      .requireOneOf(input.partOfSpeech, PARTS_OF_SPEECH, 'partOfSpeech')
      .requireNonNegativeIntOrNull(input.frequency ?? null, 'frequency')
      .throwIfInvalid();

    const slug = input.slug?.trim() || slugify(word);

    return new Word({
      id: options.id,
      word,
      slug,
      pronunciation: nullableTrim(input.pronunciation),
      ipa: nullableTrim(input.ipa),
      difficulty: input.difficulty,
      frequency: input.frequency ?? null,
      partOfSpeech: input.partOfSpeech,
      meaning,
      hindiMeaning: nullableTrim(input.hindiMeaning),
      synonyms: normalizeList(input.synonyms),
      antonyms: normalizeList(input.antonyms),
      rootWord: nullableTrim(input.rootWord),
      prefix: nullableTrim(input.prefix),
      suffix: nullableTrim(input.suffix),
      etymology: nullableTrim(input.etymology),
      exampleSentence: nullableTrim(input.exampleSentence),
      commonMistakes: nullableTrim(input.commonMistakes),
      ai: { ...EMPTY_AI_CONTENT, ...normalizeAi(input.ai) },
      status: input.status ?? WordStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rehydrate a word from persistence. Assumes stored data is already valid. */
  static reconstitute(props: WordProps): Word {
    return new Word({
      ...props,
      synonyms: [...props.synonyms],
      antonyms: [...props.antonyms],
      ai: { ...props.ai },
    });
  }

  get id(): string {
    return this.props.id;
  }
  get word(): string {
    return this.props.word;
  }
  get slug(): string {
    return this.props.slug;
  }
  get difficulty(): Difficulty {
    return this.props.difficulty;
  }
  get partOfSpeech(): PartOfSpeech {
    return this.props.partOfSpeech;
  }
  get meaning(): string {
    return this.props.meaning;
  }
  get synonyms(): readonly string[] {
    return this.props.synonyms;
  }
  get antonyms(): readonly string[] {
    return this.props.antonyms;
  }
  get status(): WordStatus {
    return this.props.status;
  }
  get ai(): Readonly<WordAiContent> {
    return this.props.ai;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** True when the word has at least the two headline mnemonics. */
  hasCompleteMnemonics(): boolean {
    return Boolean(this.props.ai.hinglishMnemonic && this.props.ai.englishMnemonic);
  }

  isPublished(): boolean {
    return this.props.status === WordStatus.PUBLISHED;
  }

  /** Merge new AI-generated content, ignoring blank values. */
  applyAiContent(patch: Partial<WordAiContent>, now: Date = new Date()): void {
    this.props.ai = { ...this.props.ai, ...normalizeAi(patch) };
    this.touch(now);
  }

  /** Apply a validated partial update to the word's lexical fields. */
  update(patch: UpdateWordInput, now: Date = new Date()): void {
    const next: WordProps = { ...this.props };

    if (patch.word !== undefined) next.word = patch.word.trim();
    if (patch.meaning !== undefined) next.meaning = patch.meaning.trim();
    if (patch.difficulty !== undefined) next.difficulty = patch.difficulty;
    if (patch.partOfSpeech !== undefined) next.partOfSpeech = patch.partOfSpeech;
    if (patch.frequency !== undefined) next.frequency = patch.frequency;
    if (patch.status !== undefined) next.status = patch.status;
    if (patch.synonyms !== undefined) next.synonyms = normalizeList(patch.synonyms);
    if (patch.antonyms !== undefined) next.antonyms = normalizeList(patch.antonyms);
    if (patch.pronunciation !== undefined) next.pronunciation = nullableTrim(patch.pronunciation);
    if (patch.ipa !== undefined) next.ipa = nullableTrim(patch.ipa);
    if (patch.hindiMeaning !== undefined) next.hindiMeaning = nullableTrim(patch.hindiMeaning);
    if (patch.rootWord !== undefined) next.rootWord = nullableTrim(patch.rootWord);
    if (patch.prefix !== undefined) next.prefix = nullableTrim(patch.prefix);
    if (patch.suffix !== undefined) next.suffix = nullableTrim(patch.suffix);
    if (patch.etymology !== undefined) next.etymology = nullableTrim(patch.etymology);
    if (patch.exampleSentence !== undefined)
      next.exampleSentence = nullableTrim(patch.exampleSentence);
    if (patch.commonMistakes !== undefined)
      next.commonMistakes = nullableTrim(patch.commonMistakes);

    if (patch.slug !== undefined && patch.slug.trim().length > 0) {
      next.slug = patch.slug.trim();
    } else if (patch.word !== undefined) {
      next.slug = slugify(next.word);
    }

    new Guard()
      .requireNonEmpty(next.word, 'word')
      .requireMaxLength(next.word, MAX_WORD_LENGTH, 'word')
      .requireNonEmpty(next.meaning, 'meaning')
      .requireMaxLength(next.meaning, MAX_MEANING_LENGTH, 'meaning')
      .requireOneOf(next.difficulty, DIFFICULTIES, 'difficulty')
      .requireOneOf(next.partOfSpeech, PARTS_OF_SPEECH, 'partOfSpeech')
      .requireNonNegativeIntOrNull(next.frequency, 'frequency')
      .throwIfInvalid();

    next.updatedAt = now;
    this.props = next;
  }

  /** Transition to PUBLISHED. Requires a meaning (guaranteed) and mnemonics. */
  publish(now: Date = new Date()): void {
    new Guard()
      .add(!this.hasCompleteMnemonics(), 'word requires Hinglish and English mnemonics to publish')
      .throwIfInvalid();
    if (!WORD_STATUSES.includes(this.props.status)) return;
    this.props.status = WordStatus.PUBLISHED;
    this.touch(now);
  }

  archive(now: Date = new Date()): void {
    this.props.status = WordStatus.ARCHIVED;
    this.touch(now);
  }

  private touch(now: Date): void {
    this.props.updatedAt = now;
  }

  /** Immutable snapshot for persistence/serialization. */
  toJSON(): WordProps {
    return {
      ...this.props,
      synonyms: [...this.props.synonyms],
      antonyms: [...this.props.antonyms],
      ai: { ...this.props.ai },
    };
  }
}

function normalizeAi(patch: Partial<WordAiContent> | undefined): Partial<WordAiContent> {
  if (!patch) return {};
  const result: Partial<WordAiContent> = {};
  for (const key of Object.keys(patch) as (keyof WordAiContent)[]) {
    const value = nullableTrim(patch[key]);
    if (value !== null) result[key] = value;
  }
  return result;
}
