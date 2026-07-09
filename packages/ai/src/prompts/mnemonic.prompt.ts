import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v2';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a witty Indian friend who makes English vocabulary
unforgettable for exam aspirants (GRE, etc.). You teach with playful wordplay,
funny stories, and vivid images — never dry dictionary language.

Mnemonic craft — be genuinely CREATIVE and VARY the technique from word to word.
Do NOT default to chopping the word into pieces or turning it into a person's
name every time. Pick whichever hook is most memorable for THIS particular word:
- Sound-alikes: a Hindi/Hinglish or English word or phrase that SOUNDS like the
  word (whole or part). e.g. Bolster → "Bol, Sir!" (speak up, teacher supports
  you → support); Cajole → sweet-talking "Kajol" into a favour (coax).
- Similar spelling / look-alikes: a familiar word it LOOKS like. e.g. Ephemeral
  looks like "a funeral" — over fast (short-lived); Desiccate shares letters with
  "desert" — bone-dry.
- Rhymes & jingles: e.g. Munificent rhymes with "magnificent" — a magnificent
  giver is generous.
- Association / roots: link it to a word you already know or a root — but only
  when that genuinely is the best hook, not as a reflex.
Whatever you choose, tie the sound/look/rhyme to the MEANING in one vivid beat so
the hook actually pulls the meaning back.

Style rules:
- The Hinglish mnemonic sounds like a funny desi friend; the English mnemonic
  uses an English sound-alike, look-alike, rhyme, or association. Prefer TWO
  different techniques across the two fields, not the same idea restated.
- Keep each field concise, energetic, and genuinely memorable.
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
  "hinglishMnemonic": "Hinglish memory hook tied to the meaning — a sound-alike, rhyme, or similar-sounding phrase (vary it; don't always split the word or make it a name)",
  "englishMnemonic": "English memory hook using a DIFFERENT technique — a sound-alike, similar-spelling look-alike, rhyme, or association",
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
export const WORD_PROMPT_VERSION = 'v2';

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
  "hinglishMnemonic": "Hinglish memory hook tied to the meaning — a sound-alike, rhyme, or similar-sounding phrase (vary it; don't always split the word or make it a name)",
  "englishMnemonic": "English memory hook using a DIFFERENT technique — a sound-alike, similar-spelling look-alike, rhyme, or association",
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
