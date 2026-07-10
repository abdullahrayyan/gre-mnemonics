import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v3';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a witty Indian friend who makes English vocabulary
unforgettable for exam aspirants (GRE, etc.). You teach with playful wordplay,
funny mini-stories, and vivid images — never dry dictionary language.

THE GOLDEN RULE — every mnemonic MUST do both:
1. ANCHOR the word to a REAL, familiar word the learner already knows (English OR
   Hindi/Hinglish) that SOUNDS LIKE or LOOKS LIKE the target. It must be a genuine
   word with its own meaning — NEVER invented gibberish or an empty syllable-mash.
2. CONNECT that anchor to the word's MEANING with one concrete image or tiny story,
   so the hook actually explains what the word means.
If a hook doesn't lean on a real, recognisable word AND link to the meaning, it is
useless — reject phonetic noise like "Ab jura do", "Ab Bounty", "Adul-tare humein".

Good vs bad — study the difference:
- abound (plentiful): BAD "Ab Bounty!". GOOD anchor "BOUNDARY" → so plentiful it
  spills past every boundary.
- abjure (formally renounce): BAD "Ab jura do". GOOD anchor "JURY" → he stood
  before the jury and renounced his old gang for good.
- abstain (hold back / refrain): GOOD anchor "STAIN" → he abstained from the wine
  so it wouldn't stain his white shirt.
- adulterate (spoil by adding inferior stuff): GOOD anchor "ADULT" → shady adults
  inject fruit with cheap syrup to fatten it — adulterating it.

Pick whichever real-word anchor fits best — a sound-alike, a look-alike, a rhyme,
or a shared root. VARY it across words; do NOT reflexively chop "ab-/re-/de-" off
prefix words, and do not turn every word into a person's name.

Style rules:
- The Hinglish mnemonic sounds like a funny desi friend and may anchor on a Hindi
  word; the English mnemonic anchors on an English word. Use DIFFERENT anchors in
  the two fields — never the same idea restated.
- Keep each field to one clear, energetic, memorable beat.
- The image prompt must be a concrete, literal scene an image model can draw.
- Quiz questions must have exactly one correct answer that appears in options.
- Reply with a SINGLE valid JSON object and nothing else. No markdown fences.`;

/** Build the chat messages for a full mnemonic-set generation. */
export function buildMnemonicMessages(request: MnemonicRequest): AiMessage[] {
  const facts = [
    `Word: ${request.word}`,
    request.meaning ? `Meaning: ${request.meaning}` : 'Meaning: (infer the standard meaning)',
    request.partOfSpeech ? `Part of speech: ${request.partOfSpeech}` : null,
    request.hindiMeaning ? `Hindi meaning: ${request.hindiMeaning}` : null,
    request.difficulty ? `Difficulty: ${request.difficulty}` : null,
    request.examType ? `Target exam: ${request.examType}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const userPrompt = `Generate memory aids for this word.

${facts}

Return a JSON object with EXACTLY these keys:
{
  "hinglishMnemonic": "Hinglish hook anchored on a REAL Hindi/English word that sounds/looks like it, then linked to the meaning (e.g. abstain->'stain'). No empty syllable-mashes.",
  "englishMnemonic": "English hook anchored on a DIFFERENT real word that sounds/looks like it, then linked to the meaning (e.g. abound->'boundary').",
  "story": "a short, funny story that fixes the meaning in memory",
  "beginnerExplanation": "simple explanation for a beginner",
  "hindiExplanation": "explanation in Hindi (Devanagari)",
  "rootExplanation": "root/prefix/suffix/etymology explanation",
  "realLifeExample": "a real-life example sentence using the word",
  "visualImagination": "a vivid mental image to visualize",
  "memoryTrick": "a quick memory trick",
  "imagePrompt": "a literal scene description for an image generator",
  "quizQuestions": [
    { "type": "WORD_TO_MEANING", "prompt": "...", "options": ["...","...","...","..."], "correctAnswer": "...", "explanation": "..." }
  ]
}

Provide 3-5 quiz questions using types from: WORD_TO_MEANING, MEANING_TO_WORD,
SYNONYM, ANTONYM, SENTENCE_COMPLETION, FILL_IN_BLANK, ROOT, MNEMONIC_RECALL.`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

/** Bump when the word prompt changes so caches invalidate. */
export const WORD_PROMPT_VERSION = 'v3';

/** Build the chat messages for a full word entry (lexical fields + mnemonics). */
export function buildWordMessages(word: string, examType?: string): AiMessage[] {
  const userPrompt = `Generate a COMPLETE learning entry for the English word "${word}".
${examType ? `Target exam: ${examType}` : ''}

Return a JSON object with EXACTLY these keys:
{
  "meaning": "concise, accurate definition",
  "hindiMeaning": "the meaning in Hindi (Devanagari)",
  "partOfSpeech": "one of NOUN, VERB, ADJECTIVE, ADVERB, PRONOUN, PREPOSITION, CONJUNCTION, INTERJECTION, DETERMINER, PHRASE, OTHER",
  "difficulty": "one of BEGINNER, EASY, MEDIUM, HARD, EXPERT",
  "synonyms": ["..."],
  "antonyms": ["..."],
  "rootWord": "root/etymology token or null",
  "exampleSentence": "a natural example sentence using the word",
  "hinglishMnemonic": "Hinglish hook anchored on a REAL Hindi/English word that sounds/looks like it, then linked to the meaning (e.g. abstain->'stain'). No empty syllable-mashes.",
  "englishMnemonic": "English hook anchored on a DIFFERENT real word that sounds/looks like it, then linked to the meaning (e.g. abound->'boundary').",
  "story": "a short, funny story that fixes the meaning",
  "beginnerExplanation": "simple explanation for a beginner",
  "hindiExplanation": "explanation in Hindi (Devanagari)",
  "rootExplanation": "root/prefix/suffix/etymology explanation",
  "realLifeExample": "a real-life example sentence",
  "visualImagination": "a vivid mental image",
  "memoryTrick": "a quick memory trick",
  "imagePrompt": "a literal scene description for an image generator",
  "quizQuestions": [
    { "type": "WORD_TO_MEANING", "prompt": "...", "options": ["...","...","...","..."], "correctAnswer": "...", "explanation": "..." }
  ]
}

The meaning must be accurate. Provide 3-5 quiz questions. Reply with ONE JSON object only.`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}
