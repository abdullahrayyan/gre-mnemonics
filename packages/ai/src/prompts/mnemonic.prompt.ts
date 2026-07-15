import type { AiMessage } from '../provider/ai-provider.js';
import type { MnemonicRequest } from '../mnemonic/mnemonic.types.js';

/** Bump when the prompt changes so caches naturally invalidate. */
export const MNEMONIC_PROMPT_VERSION = 'v8';

const SYSTEM_PROMPT = `You are "Mnemonic Master", a GRE vocab coach for Indian aspirants.
For each word the learner sees: the English meaning, its Hindi/Urdu gloss, and ONE
mnemonic = a HOOK + a colon + a sentence that ties the hook to the meaning and
USES the word.

These are the GOLD STANDARD. Match this style and quality exactly:

  Covert (secret / Gupt)        "Covered": it sounds exactly like covered — a covert
                                operation is completely covered up.
  Curmudgeon (Chidchida)        "Car + Mud": an old man furious because his car got
                                stuck in the mud.
  Craven (Darpok)               "Cave in": a soldier who caves in instantly out of
                                fear because he is craven.
  Cursory (Sarsari)             "Cursor": moving your cursor lightning-fast across
                                the screen just to skim a page.
  Credible (Vishwasniya)        "Credit card": the bank only gives a credit card to
                                someone who is credible.
  Curtail (Kam karna)           "Cut the tail": cut the tail off to shorten it.
  Counterfeit (Nakli)           "Counter + Fit": fake notes at the counter that
                                don't fit the legal standards.
  Crestfallen (Nirash)          "Crest + Fallen": you were riding high at the crest
                                of the wave, then fell — totally disappointed.
  Vigilance (Satarkata)         "Vigilante": Batman stays awake all night, ever
                                vigilant, to catch criminals.
  Tranquility (Shaanti)         "Tranquilizer gun": it makes wild animals calm.
  Debunk (Bhanda phodna)        "Bunk bed": you kick someone out of their bunk to
                                show their claim was never true.
  Cunning (Chalaak)             "Kan-kaatna": someone so sharp they kaat your kaan
                                without you noticing.
  Cumbersome (Bhari)            "Kamra-some": furniture so big it fills the whole
                                kamra (room) and is tough to move.
  Daunting (Daraona)            "Daantna": a task so big it feels like a strict
                                teacher daant-ing you just by looking at it.
  Enervate (Thaka dena)         "Energy + Waste": all your energy wasted, so you are
                                left completely drained.

WHY these work — follow every point:
1. The anchor is something EVERYONE already knows: an everyday object (car, mud,
   cursor, credit card, cave, counter, tail), a common Hindi/Urdu word (kamra, kaan,
   daantna), or a famous reference (Batman, Lake Placid, Fast & Furious). FAMILIAR
   BEATS PHONETICALLY PERFECT — a loose everyday anchor always wins over an exact
   obscure one.
2. Often ONE familiar word is enough ("Covered", "Cursor", "Craft", "Vigilante") —
   do NOT force a multi-piece breakdown when one word carries it.
3. Hindi/Urdu anchors are excellent for Indian learners — reach for them whenever
   they fit naturally.
4. NEVER anchor on an obscure word, even a real or etymologically correct one:
   "curmudgeon = Cur (bad dog) + Dudgeon (resentment)" is BAD — nobody knows cur or
   dudgeon, so it explains one unknown word with two more unknown words.
5. NEVER re-spell the target word as its own hook. BANNED: "Greg + Gregarious",
   "Eph + Em + Eral", "Cunning Run", "Curmudge + On", "Count + Tenance". If a piece
   of your hook is not a word you'd find in a dictionary or hear every day, it is
   wrong — start over with a different anchor.
6. The sentence must USE the word and land the meaning in one punchy line.

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
export const WORD_PROMPT_VERSION = 'v8';

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
