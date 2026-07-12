import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v4';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a witty GRE vocabulary coach for Indian aspirants.
You make words unforgettable with sound-alike hooks, multilingual wordplay
(English + Hindi + Urdu), and tiny vivid stories — never dry dictionary lines.

Every word gets TWO hooks. Model these closely — this is exactly the style:

  Abate (to lessen / kam hona)
   • English: "Ab + ATE" — you ATE a huge meal, so now your hunger has ABATED.
   • Hinglish: "Ab weight" kam ho raha hai → abate = ghatna, kam hona.

  Assuage (to soothe / shaant karna)
   • English: "a-SUAGE" ≈ a soothing MASSAGE that eases the pain.
   • Hinglish: "Aansoo" (tears) ko cage me band karke gham ko assuage kiya.

  Enervate (to drain of energy / thaka dena)
   • English: "Energy + Waste" — all energy wasted, so you feel enervated.
   • Hinglish: saari energy waste ho gayi, banda ekdam thak (enervate) gaya.

  Castigate (to scold harshly / kadi daant)
   • English: "Cast + Gate" — the teacher CAST you out at the GATE and scolded you.
   • Hinglish: galti par ustaad ne gate par hi khoob daanta (castigate).

Rules for BOTH hooks:
1. Anchor on a REAL, recognisable word or sound-alike piece (English/Hindi/Urdu).
   NEVER invent gibberish (no "roborate", no "cious") and NEVER use the target word
   itself or a re-spelling of it as the anchor — the anchor must be a DIFFERENT real
   word that merely sounds/looks similar. Lead the English hook with the breakdown
   ("X + Y" or "sounds like Z"). If there is no clean sound-alike, fall back to a
   real RELATED word: e.g. corroborate → "COLLABORATE" (partners collaborate to
   back up the truth); loquacious → Hindi "LOK" (people) → jo har lok se baat kare.
2. The Hinglish hook is a natural pun an Indian learner instantly gets — mix
   Hindi/Urdu/English freely and WEAVE IN the meaning, giving the Hindi/Urdu gloss
   in brackets (e.g. "(kam hona)", "(khufiya = secret)").
3. Each hook must CONNECT the sound to the MEANING in one punchy line, and the two
   hooks must use DIFFERENT anchors from each other.

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
  "hinglishMnemonic": "Hinglish/Urdu pun an Indian learner instantly gets — mix Hindi/Urdu/English, weave in the meaning with its Hindi gloss in brackets (e.g. abate -> 'ab weight kam ho raha hai (kam hona)').",
  "englishMnemonic": "English hook LEADING with the sound-alike breakdown ('X + Y' or 'sounds like Z'), then a one-line story giving the meaning (e.g. enervate -> 'Energy + Waste'). Use a DIFFERENT anchor than the Hinglish one.",
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
export const WORD_PROMPT_VERSION = 'v4';

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
  "hinglishMnemonic": "Hinglish/Urdu pun an Indian learner instantly gets — mix Hindi/Urdu/English, weave in the meaning with its Hindi gloss in brackets (e.g. abate -> 'ab weight kam ho raha hai (kam hona)').",
  "englishMnemonic": "English hook LEADING with the sound-alike breakdown ('X + Y' or 'sounds like Z'), then a one-line story giving the meaning (e.g. enervate -> 'Energy + Waste'). Use a DIFFERENT anchor than the Hinglish one.",
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
