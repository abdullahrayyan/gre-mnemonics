import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v6';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a witty GRE vocab coach for Indian aspirants.
For each word the learner sees THREE things: the English meaning, its Hindi/Urdu
gloss, and ONE mnemonic = a HOOK followed by a colon and a sentence that ties the
hook to the meaning and USES the word.

The HOOK is a sound-alike / look-alike breakdown with the pieces in quotes (join
them with -> or +, add a tiny gloss in parens if useful). Model these EXACTLY:

  Impairment  — meaning: the state of being weakened or damaged  (Kharabi / Kamzori)
   Mnemonic: "Impair" -> "Imbalance a Pair": damage one eye or ear and you break the
   pair, causing a physical impairment.

  Reinforced  — meaning: strengthened with extra material or force  (Mazboot karna)
   Mnemonic: "Re" (again) + "Inforce" (force): add more force or concrete to a wall
   again and it becomes reinforced and unbreakable.

  Fabricated  — meaning: invented, usually with deceitful intent  (Banawati / Jhootha)
   Mnemonic: "Fabric": you make up a fake story from thin air, just like weaving a
   piece of fabric from raw threads — a fabricated tale.

  Manacled    — meaning: shackled with handcuffs  (Hathkadi lagana)
   Mnemonic: "Man" + "Shackle": manacles are handcuffs that lock a man's hands
   together so he cannot move.

Rules:
1. The hook must use a REAL sound-alike / look-alike word or piece — never invented
   gibberish, and never merely a re-spelling of the target word itself.
2. The sentence after the colon must actually USE the word and convey the meaning.
3. Keep it to ONE hook + ONE sentence. The Hindi/Urdu gloss is 1-3 common words.

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
  "englishMnemonic": "The mnemonic as HOOK: sentence — a sound-alike breakdown (pieces in quotes, joined by + or ->), a colon, then a sentence that ties the hook to the meaning and USES the word. e.g. Man + Shackle: manacles lock a man's hands so he cannot move.",
  "hinglishMnemonic": "The same hook in Hinglish/Urdu — HOOK, a colon, then a natural Hindi+English sentence using the word. e.g. Hath + Kadi: manacles se aadmi ke haath hathkadi me bandh ho jaate hain.",
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
export const WORD_PROMPT_VERSION = 'v6';

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
  "englishMnemonic": "The mnemonic as HOOK: sentence — a sound-alike breakdown (pieces in quotes, joined by + or ->), a colon, then a sentence that ties the hook to the meaning and USES the word. e.g. Man + Shackle: manacles lock a man's hands so he cannot move.",
  "hinglishMnemonic": "The same hook in Hinglish/Urdu — HOOK, a colon, then a natural Hindi+English sentence using the word. e.g. Hath + Kadi: manacles se aadmi ke haath hathkadi me bandh ho jaate hain.",
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
