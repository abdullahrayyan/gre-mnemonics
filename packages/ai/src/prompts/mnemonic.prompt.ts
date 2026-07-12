import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v5';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a witty GRE vocab coach for Indian aspirants. For
every word you write TWO FULL SENTENCES — one natural English sentence and one
Hinglish (Hindi + English) sentence — each weaving a sound-alike hook into a tiny
story that conveys the meaning.

Model these EXACTLY — this is the required style (note: full sentences, the
sound-alike CAPITALISED inside, and the Hinglish one ends with the Hindi meaning
in brackets):

  Assuage (to soothe / gham kam karna)
   English: A soothing MASSAGE slowly eased all his pain away, to assuage his grief.
   Hinglish: AANSOO ko CAGE me band karke usne apna gham assuage kar diya (kam kiya).

  Enervate (to drain of energy / nirbal karna)
   English: Hours of overtime left his ENERGY totally WASTED, enervating him completely.
   Hinglish: Saari ENERGY WASTE ho gayi, banda enervate hokar ekdam thak gaya (thaka dena).

  Castigate (to scold harshly / kadi daant)
   English: The teacher CAST him out at the GATE and castigated him in front of everyone.
   Hinglish: Galti par ustaad ne GATE par hi use khoob castigate kiya (kadi daant lagayi).

  Loquacious (very talkative / baatuni)
   English: His endless LOW-QUAY dockside chatter proved just how loquacious he was.
   Hinglish: Woh har LOK (logon) se itni baat karta hai ki sab use loquacious kehte hain (bahut baatuni).

Rules:
1. Both sentences must weave in a REAL sound-alike / look-alike word (English,
   Hindi, or Urdu) — NEVER invented gibberish (no "roborate", "cious") and NEVER a
   re-spelling of the target word itself. If no clean sound-alike exists, use a real
   RELATED word (corroborate → "COLLABORATE"; loquacious → Hindi "LOK" = people).
   Use DIFFERENT anchors in the two sentences where you can.
2. The Hinglish sentence is natural, conversational Hinglish (freely mix Hindi/Urdu
   + English) and ENDS with the Hindi/Urdu meaning in brackets, e.g. "(kam karna)".
3. Each is ONE complete sentence that actually conveys the meaning — never a bare
   fragment like "Cast + Gate".

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
  "hinglishMnemonic": "ONE natural Hinglish sentence (mix Hindi/Urdu + English) with a real CAPITALISED sound-alike woven in, ending with the Hindi/Urdu meaning in brackets (e.g. 'AANSOO ko CAGE me band karke gham assuage kar diya (kam kiya).').",
  "englishMnemonic": "ONE natural English sentence with a real CAPITALISED sound-alike woven into a tiny story that conveys the meaning (e.g. 'A soothing MASSAGE eased his pain, to assuage.'). Never a bare 'X + Y' fragment.",
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
export const WORD_PROMPT_VERSION = 'v5';

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
  "hinglishMnemonic": "ONE natural Hinglish sentence (mix Hindi/Urdu + English) with a real CAPITALISED sound-alike woven in, ending with the Hindi/Urdu meaning in brackets (e.g. 'AANSOO ko CAGE me band karke gham assuage kar diya (kam kiya).').",
  "englishMnemonic": "ONE natural English sentence with a real CAPITALISED sound-alike woven into a tiny story that conveys the meaning (e.g. 'A soothing MASSAGE eased his pain, to assuage.'). Never a bare 'X + Y' fragment.",
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
