import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Difficulty,
  PartOfSpeech,
  User,
  UserRole,
  Word,
  WordStatus,
  type CreateWordInput,
} from '@mnemonic/core';
import type { AchievementDto, LeaderboardEntryDto } from '@mnemonic/types';
import type { RawStats } from '../modules/stats/application/stats-store.port.js';
import { toWordResponse, type WordResponse } from '../modules/words/application/word.dto.js';
import { CURATED_MNEMONICS } from './curated-mnemonics.js';

/** Stable identity for the seeded demo learner (matches {@link DEMO_CLERK_ID}). */
export const DEMO_USER_ID = 'demo-user-0000-0000-0000-000000000001';
export const DEMO_CLERK_ID = 'demo_user';
export const DEMO_EMAIL = 'demo@mnemonicmaster.ai';
export const DEMO_DISPLAY_NAME = 'Demo Learner';

/**
 * A curated slice of the GRE corpus with full, hand-written learning content so
 * the offline demo shows real mnemonics, stories, and example sentences — not
 * placeholder text. Every entry is PUBLISHED so it surfaces in words, reviews,
 * and quizzes without a database or the AI engine.
 */
const DEMO_WORD_INPUTS: CreateWordInput[] = [
  {
    word: 'Bolster',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.VERB,
    frequency: 92,
    pronunciation: 'BOHL-ster',
    ipa: '/ˈboʊlstər/',
    meaning: 'To support, strengthen, or reinforce something.',
    hindiMeaning: 'सहारा देना / मज़बूत करना',
    synonyms: ['reinforce', 'strengthen', 'buttress', 'shore up'],
    antonyms: ['undermine', 'weaken', 'sap'],
    rootWord: 'bolster (cushion)',
    etymology: 'Old English "bolster", a long cushion that props you up.',
    exampleSentence: 'The new data bolstered the professor’s controversial theory.',
    ai: {
      hinglishMnemonic: 'Bolster → "Bol, Sir!" — jab tum confidently "Bol, Sir!" karte ho, tumhara argument strong ho jaata hai.',
      englishMnemonic: 'A BOLSTER pillow props up your back — to bolster is to prop up an idea.',
      story: 'Before the debate, Sir told Rahul, "Bol, Sir!" and every fact Rahul spoke bolstered his case until the judges nodded.',
      memoryTrick: 'Bolster = Bol (speak) + ster → speak up to support.',
      visualMemoryPrompt: 'A giant bolster pillow holding up a wobbling tower of books.',
    },
  },
  {
    word: 'Ephemeral',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 88,
    pronunciation: 'ih-FEM-er-uhl',
    ipa: '/ɪˈfɛmərəl/',
    meaning: 'Lasting for a very short time; fleeting.',
    hindiMeaning: 'क्षणभंगुर / अल्पकालिक',
    synonyms: ['fleeting', 'transient', 'momentary', 'evanescent'],
    antonyms: ['permanent', 'enduring', 'everlasting'],
    rootWord: 'Greek "ephēmeros" (lasting a day)',
    etymology: 'From Greek epi- (on) + hēmera (day) — living only for a day.',
    exampleSentence: 'Fame on social media can be ephemeral, gone by the next morning.',
    ai: {
      hinglishMnemonic: 'Ephemeral → "E-fem-eral" → ek film reel jo bas ek pal chalti hai aur khatam.',
      englishMnemonic: 'Ephemeral sounds like "a funeral" — over quickly, then gone.',
      story: 'The mayfly boasted of its beauty at dawn; by dusk its ephemeral life had already ended.',
      memoryTrick: 'Ephemeral ↔ "a day" (Greek hēmera) — only a day long.',
      visualMemoryPrompt: 'A soap bubble glinting for a second before it pops.',
    },
  },
  {
    word: 'Gregarious',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 85,
    pronunciation: 'gri-GAIR-ee-uhs',
    ipa: '/ɡrɪˈɡɛəriəs/',
    meaning: 'Fond of company; sociable.',
    hindiMeaning: 'मिलनसार / यूथचारी',
    synonyms: ['sociable', 'convivial', 'outgoing', 'affable'],
    antonyms: ['reclusive', 'introverted', 'antisocial'],
    rootWord: 'Latin "grex" (herd, flock)',
    etymology: 'From Latin gregarius — belonging to a flock (grex).',
    exampleSentence: 'Her gregarious nature made her the heart of every gathering.',
    ai: {
      hinglishMnemonic: 'Gregarious → "Greg + various" → Greg ke various dost hain, woh bada milnasar hai.',
      englishMnemonic: 'A GREGARIOUS person joins the GROUP (grex = herd).',
      story: 'Greg knew various people at the party because his gregarious spirit pulled the whole herd toward him.',
      memoryTrick: 'grex = herd → gregarious loves the herd.',
      visualMemoryPrompt: 'One smiling person surrounded by a laughing crowd.',
    },
  },
  {
    word: 'Pragmatic',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 90,
    pronunciation: 'prag-MAT-ik',
    ipa: '/præɡˈmætɪk/',
    meaning: 'Dealing with things practically rather than theoretically.',
    hindiMeaning: 'व्यावहारिक',
    synonyms: ['practical', 'realistic', 'sensible', 'down-to-earth'],
    antonyms: ['idealistic', 'impractical', 'dogmatic'],
    rootWord: 'Greek "pragma" (deed, action)',
    etymology: 'From Greek pragmatikos — relating to action.',
    exampleSentence: 'She took a pragmatic approach and fixed what could be fixed today.',
    ai: {
      hinglishMnemonic: 'Pragmatic → "Practical + automatic" → jo automatically practical solution chunta hai.',
      englishMnemonic: 'PRAGmatic → think PRACTICAL, they nearly rhyme.',
      story: 'While others debated theory, the pragmatic engineer just picked up a wrench and solved it.',
      memoryTrick: 'pragma = action → pragmatic = action-focused.',
      visualMemoryPrompt: 'An engineer ignoring a whiteboard of formulas to tighten a bolt.',
    },
  },
  {
    word: 'Ubiquitous',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 87,
    pronunciation: 'yoo-BIK-wi-tuhs',
    ipa: '/juːˈbɪkwɪtəs/',
    meaning: 'Present, appearing, or found everywhere.',
    hindiMeaning: 'सर्वव्यापी',
    synonyms: ['omnipresent', 'pervasive', 'universal', 'everywhere'],
    antonyms: ['rare', 'scarce', 'localized'],
    rootWord: 'Latin "ubique" (everywhere)',
    etymology: 'From Latin ubique — in every place.',
    exampleSentence: 'Smartphones have become ubiquitous in modern life.',
    ai: {
      hinglishMnemonic: 'Ubiquitous → "You-be-quick-tous" → tum jahan bhi quickly dekho, yeh wahan hai.',
      englishMnemonic: 'U-B-everywhere: ubiquitous = you be everywhere.',
      story: 'The jingle was so ubiquitous that you could not enter any shop without humming it.',
      memoryTrick: 'ubique = everywhere.',
      visualMemoryPrompt: 'The same billboard repeating on every building down a street.',
    },
  },
  {
    word: 'Cacophony',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.NOUN,
    frequency: 80,
    pronunciation: 'kuh-KOF-uh-nee',
    ipa: '/kəˈkɒfəni/',
    meaning: 'A harsh, discordant mixture of sounds.',
    hindiMeaning: 'कर्कश शोर',
    synonyms: ['din', 'racket', 'discord', 'clamor'],
    antonyms: ['harmony', 'euphony', 'melody'],
    rootWord: 'Greek "kakos" (bad) + "phone" (sound)',
    etymology: 'From Greek kakophonia — bad sound.',
    exampleSentence: 'A cacophony of horns filled the crowded intersection.',
    ai: {
      hinglishMnemonic: 'Cacophony → "Kaka-phone" → kaka ka phone bar bar bajta rahe = kaan-phodu shor.',
      englishMnemonic: 'CACO = bad (kakos), PHONY = sound → bad sound.',
      story: 'When every cousin picked up a different instrument, the reunion dissolved into pure cacophony.',
      memoryTrick: 'kakos (bad) + phone (sound) = cacophony.',
      visualMemoryPrompt: 'Cartoon musicians all playing clashing notes with squiggly sound waves.',
    },
  },
  {
    word: 'Capricious',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 83,
    pronunciation: 'kuh-PRISH-uhs',
    ipa: '/kəˈprɪʃəs/',
    meaning: 'Given to sudden, unpredictable changes of mood or behavior.',
    hindiMeaning: 'चंचल / अस्थिर',
    synonyms: ['fickle', 'mercurial', 'volatile', 'whimsical'],
    antonyms: ['steady', 'constant', 'consistent'],
    rootWord: 'Italian "capriccio" (whim)',
    etymology: 'From Italian capriccio — a sudden whim (literally "goat leap").',
    exampleSentence: 'The capricious weather shifted from sun to storm within minutes.',
    ai: {
      hinglishMnemonic: 'Capricious → "Cap-rich-us" → ameer aadmi jiska mood cap ki tarah kabhi bhi palat jaaye.',
      englishMnemonic: 'Think of a CAPRICORN goat leaping about unpredictably.',
      story: 'The capricious king would knight a peasant at breakfast and banish him by lunch.',
      memoryTrick: 'capriccio = goat leap → jumps around like moods.',
      visualMemoryPrompt: 'A goat leaping erratically across shifting weather patterns.',
    },
  },
  {
    word: 'Enervate',
    difficulty: Difficulty.EXPERT,
    partOfSpeech: PartOfSpeech.VERB,
    frequency: 72,
    pronunciation: 'EN-er-vayt',
    ipa: '/ˈɛnərveɪt/',
    meaning: 'To cause someone to feel drained of energy or vitality; weaken.',
    hindiMeaning: 'निर्बल कर देना',
    synonyms: ['weaken', 'exhaust', 'debilitate', 'sap'],
    antonyms: ['invigorate', 'energize', 'strengthen'],
    rootWord: 'Latin "enervare" (to remove the sinews)',
    etymology: 'From Latin e- (out) + nervus (sinew) — to cut the nerves out.',
    exampleSentence: 'The sweltering heat enervated the marching soldiers.',
    ai: {
      hinglishMnemonic: 'Enervate → "N-nerve-ate" → jaise koi tumhari saari nerve energy kha gaya ho.',
      englishMnemonic: 'E-NERVE-ate: take the NERVE (energy) OUT of you.',
      story: 'The endless meeting so enervated the team that no one could lift a pen by evening.',
      memoryTrick: 'e- (out) + nerve → drain the nerve/energy out.',
      visualMemoryPrompt: 'A phone battery icon draining to empty over a slumped figure.',
    },
  },
  {
    word: 'Fastidious',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 79,
    pronunciation: 'fa-STID-ee-uhs',
    ipa: '/fæˈstɪdiəs/',
    meaning: 'Very attentive to detail; hard to please and demanding cleanliness or precision.',
    hindiMeaning: 'नकचढ़ा / अति सतर्क',
    synonyms: ['meticulous', 'finicky', 'punctilious', 'scrupulous'],
    antonyms: ['careless', 'slovenly', 'lax'],
    rootWord: 'Latin "fastidium" (loathing)',
    etymology: 'From Latin fastidiosus — full of distaste, easily disgusted.',
    exampleSentence: 'The fastidious editor caught every misplaced comma.',
    ai: {
      hinglishMnemonic: 'Fastidious → "Fast + tidious" → jo fast bhi tidy rakhe, har cheez perfect.',
      englishMnemonic: 'FAST-TIDY-ous → obsessively fast at keeping things tidy.',
      story: 'So fastidious was the chef that a single crooked garnish sent the plate back to the kitchen.',
      memoryTrick: 'fastidious ↔ tidy + fussy.',
      visualMemoryPrompt: 'A person aligning pencils to a perfect grid with a ruler.',
    },
  },
  {
    word: 'Garrulous',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 74,
    pronunciation: 'GAR-uh-luhs',
    ipa: '/ˈɡærələs/',
    meaning: 'Excessively talkative, especially about trivial matters.',
    hindiMeaning: 'बातूनी',
    synonyms: ['talkative', 'loquacious', 'voluble', 'chatty'],
    antonyms: ['taciturn', 'reticent', 'laconic'],
    rootWord: 'Latin "garrire" (to chatter)',
    etymology: 'From Latin garrulus — chattering, babbling.',
    exampleSentence: 'The garrulous passenger narrated his entire life story before the first stop.',
    ai: {
      hinglishMnemonic: 'Garrulous → "Gaari-lous" → jo apni gaadi mein baith kar bina ruke bolta rahe.',
      englishMnemonic: 'GARGLE-ous: someone who gargles words nonstop.',
      story: 'The barber was so garrulous that a five-minute trim became an hour of gossip.',
      memoryTrick: 'garrire = to chatter.',
      visualMemoryPrompt: 'A parrot with an endless speech bubble trailing off the page.',
    },
  },
  {
    word: 'Laconic',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 78,
    pronunciation: 'luh-KON-ik',
    ipa: '/ləˈkɒnɪk/',
    meaning: 'Using very few words; terse.',
    hindiMeaning: 'अल्पभाषी / संक्षिप्त',
    synonyms: ['terse', 'concise', 'succinct', 'curt'],
    antonyms: ['verbose', 'garrulous', 'long-winded'],
    rootWord: 'Greek "Lakonikos" (of Laconia/Sparta)',
    etymology: 'From the Spartans of Laconia, famous for blunt, few-word replies.',
    exampleSentence: 'His laconic "Nope" ended the negotiation.',
    ai: {
      hinglishMnemonic: 'Laconic → "La-konik" → kam bol, kaam zyada — Spartan style.',
      englishMnemonic: 'LACK-onic → lacking words.',
      story: 'When threatened "If we invade, we will raze your city," the Spartans sent one laconic word back: "If."',
      memoryTrick: 'Laconia (Sparta) → laconic → few words.',
      visualMemoryPrompt: 'A stern Spartan replying with a single tiny speech bubble.',
    },
  },
  {
    word: 'Mitigate',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.VERB,
    frequency: 89,
    pronunciation: 'MIT-i-gayt',
    ipa: '/ˈmɪtɪɡeɪt/',
    meaning: 'To make less severe, serious, or painful.',
    hindiMeaning: 'कम करना / शांत करना',
    synonyms: ['alleviate', 'lessen', 'ease', 'temper'],
    antonyms: ['aggravate', 'intensify', 'worsen'],
    rootWord: 'Latin "mitigare" (to soften)',
    etymology: 'From Latin mitis (mild) + agere (to make) — to make mild.',
    exampleSentence: 'Planting trees can mitigate the effects of urban heat.',
    ai: {
      hinglishMnemonic: 'Mitigate → "Meethi-gate" → gate pe meethi baat karke gussa kam kar do.',
      englishMnemonic: 'MITI (mild) + GATE → open a gate to make things milder.',
      story: 'A cool breeze through the meethi-gate mitigated the afternoon’s brutal heat.',
      memoryTrick: 'mitis = mild → mitigate = make mild.',
      visualMemoryPrompt: 'A dimmer switch turning a blazing sun down to a gentle glow.',
    },
  },
  {
    word: 'Obfuscate',
    difficulty: Difficulty.EXPERT,
    partOfSpeech: PartOfSpeech.VERB,
    frequency: 70,
    pronunciation: 'OB-fuh-skayt',
    ipa: '/ˈɒbfʌskeɪt/',
    meaning: 'To deliberately make something unclear or hard to understand.',
    hindiMeaning: 'धुंधला/उलझा देना',
    synonyms: ['obscure', 'muddle', 'confuse', 'cloud'],
    antonyms: ['clarify', 'illuminate', 'elucidate'],
    rootWord: 'Latin "obfuscare" (to darken)',
    etymology: 'From Latin ob- (over) + fuscare (to darken).',
    exampleSentence: 'The report used jargon to obfuscate its lack of real findings.',
    ai: {
      hinglishMnemonic: 'Obfuscate → "Ob-fog-cate" → sab pe fog daal kar dhundhla kar do.',
      englishMnemonic: 'OB-FOG-scate → cover in FOG so nothing is clear.',
      story: 'The magician obfuscated the trick with so much smoke that no one saw the swap.',
      memoryTrick: 'fuscare = to darken → obfuscate = darken meaning.',
      visualMemoryPrompt: 'A clear sign disappearing behind rolling fog.',
    },
  },
  {
    word: 'Quixotic',
    difficulty: Difficulty.EXPERT,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 68,
    pronunciation: 'kwik-SOT-ik',
    ipa: '/kwɪkˈsɒtɪk/',
    meaning: 'Extremely idealistic and unrealistic; impractically chasing lofty goals.',
    hindiMeaning: 'अव्यावहारिक आदर्शवादी',
    synonyms: ['idealistic', 'romantic', 'utopian', 'starry-eyed'],
    antonyms: ['pragmatic', 'realistic', 'practical'],
    rootWord: 'From "Don Quixote"',
    etymology: 'After Cervantes’ knight Don Quixote, who tilted at windmills.',
    exampleSentence: 'His quixotic plan to end all traffic with free unicycles charmed but failed.',
    ai: {
      hinglishMnemonic: 'Quixotic → "Quick-shot-ic" → jaldbaazi mein windmills pe shot maarne wala sapno ka knight.',
      englishMnemonic: 'Quixotic = like Don QUIXOTE fighting windmills.',
      story: 'Ever quixotic, he sold his car to fund a moonshot startup run from his garage.',
      memoryTrick: 'Don Quixote → quixotic dreamer.',
      visualMemoryPrompt: 'A knight charging a giant windmill with a wooden lance.',
    },
  },
  {
    word: 'Recalcitrant',
    difficulty: Difficulty.EXPERT,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    frequency: 71,
    pronunciation: 'ri-KAL-si-truhnt',
    ipa: '/rɪˈkælsɪtrənt/',
    meaning: 'Stubbornly resistant to authority or control.',
    hindiMeaning: 'हठी / अवज्ञाकारी',
    synonyms: ['obstinate', 'unruly', 'defiant', 'intractable'],
    antonyms: ['compliant', 'obedient', 'docile'],
    rootWord: 'Latin "recalcitrare" (to kick back)',
    etymology: 'From Latin re- (back) + calcitrare (to kick) — like a mule kicking back.',
    exampleSentence: 'The recalcitrant mule refused to move no matter how hard they pulled.',
    ai: {
      hinglishMnemonic: 'Recalcitrant → "Re-kick-it-rant" → jo baar baar laat maar kar rant kare, kisi ki na sune.',
      englishMnemonic: 'RE-KICK-itrant → keeps KICKING BACK against orders.',
      story: 'The recalcitrant intern ignored every rule until even the printer seemed to defy him too.',
      memoryTrick: 'calcitrare = to kick → recalcitrant = kicks back.',
      visualMemoryPrompt: 'A mule digging in its hooves and kicking backward at its handler.',
    },
  },
];

/**
 * Load the AI-generated corpus cache (all ~1112 GRE words) if it has been built
 * via `scripts/generate-demo-corpus.ts`; otherwise return null so we fall back to
 * the small curated set. Never throws — a missing/corrupt cache is non-fatal.
 */
function loadGeneratedCorpus(): CreateWordInput[] | null {
  const path = resolve(dirname(fileURLToPath(import.meta.url)), 'demo-corpus.json');
  if (!existsSync(path)) return null;
  try {
    const rows = JSON.parse(readFileSync(path, 'utf8')) as CreateWordInput[];
    return Array.isArray(rows) && rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

/**
 * Overlay a hand-vetted mnemonic over an AI-generated entry when we have one.
 * A curated word carries a single reviewed hook, so the English/Hinglish pair is
 * collapsed to that one mnemonic (hinglish cleared).
 */
function applyCurated(input: CreateWordInput): CreateWordInput {
  const curated = CURATED_MNEMONICS[input.word.toLowerCase()];
  if (!curated) return input;
  return {
    ...input,
    meaning: curated.meaning ?? input.meaning,
    hindiMeaning: curated.hindiMeaning ?? input.hindiMeaning,
    ai: { ...input.ai, englishMnemonic: curated.mnemonic, hinglishMnemonic: null },
  };
}

/**
 * Build the demo {@link Word} aggregates (all PUBLISHED) at a fixed base time.
 * Uses the full AI-generated corpus when present, else the curated fallback set,
 * with hand-vetted mnemonics overlaid on top. Malformed generated entries are
 * skipped rather than failing the whole boot.
 */
export function buildDemoWords(now: Date): Word[] {
  const inputs = loadGeneratedCorpus() ?? DEMO_WORD_INPUTS;
  const words: Word[] = [];
  inputs.forEach((input, index) => {
    try {
      words.push(
        Word.create(
          { ...applyCurated(input), status: WordStatus.PUBLISHED },
          { id: `demo-word-${String(index + 1).padStart(4, '0')}`, now },
        ),
      );
    } catch {
      // Skip an occasional malformed AI entry; the rest of the corpus still loads.
    }
  });
  return words;
}

/** Word DTOs the in-memory review store is seeded with. */
export function toWordResponses(words: Word[]): WordResponse[] {
  return words.map(toWordResponse);
}

/** The seeded demo account (ADMIN so word writes work too). */
export function buildDemoUser(now: Date): User {
  return User.create(
    { clerkId: DEMO_CLERK_ID, email: DEMO_EMAIL, role: UserRole.ADMIN },
    { id: DEMO_USER_ID, now },
  );
}

function isoDate(now: Date, daysAgo: number): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** Realistic dashboard aggregates, anchored to the current day for a live streak. */
export function buildDemoStats(now: Date): RawStats {
  const weeklyActivity = [6, 5, 4, 3, 2, 1, 0].map((daysAgo, index) => ({
    date: isoDate(now, daysAgo),
    reviews: [8, 14, 10, 0, 12, 18, 12][index] ?? 0,
  }));
  // A 5-day active streak ending today (skip 3 days ago to mirror a rest day).
  const reviewDates = [0, 1, 2, 4, 5, 6, 7, 8].map((daysAgo) => isoDate(now, daysAgo));

  return {
    dailyGoal: 20,
    completedToday: 12,
    reviewsDue: 8,
    totalXp: 1240,
    longestStreak: 9,
    wordsLearned: 48,
    wordsMastered: 15,
    monthlyReviews: 210,
    monthlyCorrect: 176,
    weeklyActivity,
    reviewDates,
  };
}

/** A mix of earned and in-progress badges for the achievements page. */
export const DEMO_ACHIEVEMENTS: AchievementDto[] = [
  {
    key: 'first-steps',
    name: 'First Steps',
    description: 'Review your very first word.',
    tier: 'BRONZE',
    icon: null,
    status: 'EARNED',
    progress: 1,
    target: 1,
    earnedAt: null,
  },
  {
    key: 'word-collector',
    name: 'Word Collector',
    description: 'Learn 50 words.',
    tier: 'SILVER',
    icon: null,
    status: 'IN_PROGRESS',
    progress: 48,
    target: 50,
    earnedAt: null,
  },
  {
    key: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Maintain a 7-day streak.',
    tier: 'SILVER',
    icon: null,
    status: 'IN_PROGRESS',
    progress: 5,
    target: 7,
    earnedAt: null,
  },
  {
    key: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Score 100% on a quiz.',
    tier: 'GOLD',
    icon: null,
    status: 'EARNED',
    progress: 1,
    target: 1,
    earnedAt: null,
  },
  {
    key: 'xp-hunter',
    name: 'XP Hunter',
    description: 'Earn 2,000 XP.',
    tier: 'GOLD',
    icon: null,
    status: 'IN_PROGRESS',
    progress: 1240,
    target: 2000,
    earnedAt: null,
  },
  {
    key: 'mastermind',
    name: 'Mastermind',
    description: 'Master 25 words.',
    tier: 'PLATINUM',
    icon: null,
    status: 'IN_PROGRESS',
    progress: 15,
    target: 25,
    earnedAt: null,
  },
];

/** Leaderboard with the demo learner sitting mid-pack. */
export const DEMO_LEADERBOARD: LeaderboardEntryDto[] = [
  { rank: 1, name: 'Aarav', totalXp: 4820, level: 9, isCurrentUser: false },
  { rank: 2, name: 'Mei', totalXp: 3910, level: 8, isCurrentUser: false },
  { rank: 3, name: 'Sofia', totalXp: 2450, level: 6, isCurrentUser: false },
  { rank: 4, name: DEMO_DISPLAY_NAME, totalXp: 1240, level: 4, isCurrentUser: true },
  { rank: 5, name: 'Kenji', totalXp: 980, level: 4, isCurrentUser: false },
  { rank: 6, name: 'Noah', totalXp: 640, level: 3, isCurrentUser: false },
];

/** Synthetic community members (author id → display name) for the demo feed. */
export const DEMO_COMMUNITY_AUTHORS: Record<string, string> = {
  'demo-author-aarav': 'Aarav',
  'demo-author-mei': 'Mei',
  'demo-author-sofia': 'Sofia',
  'demo-author-kenji': 'Kenji',
};

export interface DemoCommunityComment {
  authorId: string;
  content: string;
  replies?: { authorId: string; content: string }[];
}

export interface DemoCommunityPost {
  /** Word text to attach to (looked up among the seeded words). */
  word: string;
  authorId: string;
  content: string;
  /** Author ids who upvoted (each counts as +1). */
  upvoters: string[];
  comments?: DemoCommunityComment[];
}

/** A small, pre-populated community feed so the page has content on first load. */
export const DEMO_COMMUNITY_POSTS: DemoCommunityPost[] = [
  {
    word: 'loquacious',
    authorId: 'demo-author-aarav',
    content:
      "Sounds like 'low-quay-shus' — picture someone at a LOW QUAY who won't stop talking to every passing boat. Loquacious = very talkative.",
    upvoters: ['demo-author-mei', 'demo-author-sofia', 'demo-author-kenji', DEMO_USER_ID],
    comments: [
      {
        authorId: 'demo-author-mei',
        content: 'Haha the low-quay image actually stuck 😄',
        replies: [{ authorId: 'demo-author-aarav', content: 'Glad it helped!' }],
      },
      { authorId: 'demo-author-sofia', content: "Mine is 'loco + talkative' — a bit loco how much they talk." },
    ],
  },
  {
    word: 'taciturn',
    authorId: 'demo-author-mei',
    content: "Rhymes with 'pass-a-turn' — a taciturn player just passes their turn without a single word. Reserved and silent.",
    upvoters: ['demo-author-aarav', 'demo-author-kenji'],
  },
  {
    word: 'capricious',
    authorId: 'demo-author-sofia',
    content: "Think of a 'Capricorn goat' leaping around unpredictably — that's a capricious mood, changing on a whim.",
    upvoters: ['demo-author-mei', DEMO_USER_ID],
    comments: [{ authorId: 'demo-author-kenji', content: 'The goat leap is such a good visual.' }],
  },
  {
    word: 'insipid',
    authorId: 'demo-author-kenji',
    content: "In-SIP-id: take a SIP of flat, warm soda — totally insipid. No flavour, dull and lifeless.",
    upvoters: ['demo-author-sofia'],
  },
];

/** Canned, on-brand tutor reply streamed by the stub AI provider in demo mode. */
export const DEMO_TUTOR_REPLY = [
  "You're in demo mode, so I'll answer from a local script (no OpenAI key needed).",
  '',
  'Take **bolster** (to support or strengthen):',
  '• Hinglish hook — "Bol, Sir!": speaking up confidently *bolsters* your argument.',
  '• Root — Old English "bolster", the long cushion that props up your back.',
  '• GRE-style sentence — "Fresh evidence bolstered the once-doubted hypothesis."',
  '',
  'Add a real OPENAI_API_KEY to get fully dynamic explanations, comparisons, and quizzes.',
].join('\n');
