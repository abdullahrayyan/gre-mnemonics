/* eslint-disable no-console */
import { Difficulty, ExamType, PartOfSpeech, slugify } from '@mnemonic/core';
import { type Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExamSeed {
  type: ExamType;
  name: string;
  description: string;
}

const EXAMS: ExamSeed[] = [
  { type: ExamType.GRE, name: 'GRE', description: 'Graduate Record Examinations' },
  { type: ExamType.TOEFL, name: 'TOEFL', description: 'Test of English as a Foreign Language' },
  {
    type: ExamType.IELTS,
    name: 'IELTS',
    description: 'International English Language Testing System',
  },
  { type: ExamType.SAT, name: 'SAT', description: 'Scholastic Assessment Test' },
  { type: ExamType.GMAT, name: 'GMAT', description: 'Graduate Management Admission Test' },
  { type: ExamType.CAT, name: 'CAT', description: 'Common Admission Test' },
  { type: ExamType.UPSC, name: 'UPSC', description: 'Union Public Service Commission' },
  { type: ExamType.SSC, name: 'SSC', description: 'Staff Selection Commission' },
  { type: ExamType.GENERAL, name: 'General English', description: 'Everyday English vocabulary' },
];

interface BadgeSeed {
  key: string;
  name: string;
  description: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  criteria: Prisma.InputJsonValue;
}

const BADGES: BadgeSeed[] = [
  {
    key: 'word-warrior',
    name: 'Word Warrior',
    description: 'Learn your first 50 words',
    tier: 'BRONZE',
    criteria: { wordsLearned: 50 },
  },
  {
    key: 'memory-master',
    name: 'Memory Master',
    description: 'Maintain a 7-day streak',
    tier: 'SILVER',
    criteria: { streak: 7 },
  },
  {
    key: 'vocabulary-ninja',
    name: 'Vocabulary Ninja',
    description: 'Score 100% on 10 quizzes',
    tier: 'GOLD',
    criteria: { perfectQuizzes: 10 },
  },
  {
    key: 'gre-champion',
    name: 'GRE Champion',
    description: 'Master 1000 GRE words',
    tier: 'DIAMOND',
    criteria: { examMastered: 'GRE', words: 1000 },
  },
  {
    key: 'century-100',
    name: '100 Words',
    description: 'Learn 100 words',
    tier: 'BRONZE',
    criteria: { wordsLearned: 100 },
  },
  {
    key: 'club-500',
    name: '500 Words',
    description: 'Learn 500 words',
    tier: 'GOLD',
    criteria: { wordsLearned: 500 },
  },
  {
    key: 'legend-1000',
    name: '1000 Words',
    description: 'Learn 1000 words',
    tier: 'PLATINUM',
    criteria: { wordsLearned: 1000 },
  },
];

interface WordSeed {
  word: string;
  difficulty: Difficulty;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  hindiMeaning: string;
  synonyms: string[];
  antonyms: string[];
  rootWord?: string;
  exampleSentence: string;
  hinglishMnemonic: string;
  englishMnemonic: string;
  greFrequencyRank: number;
}

// Starter GRE set. The full 1000-word corpus with exam frequency lands in Phase 18.
const WORDS: WordSeed[] = [
  {
    word: 'Bolster',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.VERB,
    meaning: 'to support or strengthen',
    hindiMeaning: 'सहारा देना',
    synonyms: ['support', 'reinforce', 'buttress'],
    antonyms: ['undermine', 'weaken'],
    exampleSentence: 'The good news bolstered her confidence.',
    hinglishMnemonic: '"Bol Sir!" — shout it and the teacher supports you. Bolster = support.',
    englishMnemonic: 'A bolster is a long pillow that supports your back.',
    greFrequencyRank: 120,
  },
  {
    word: 'Obdurate',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'stubbornly refusing to change one’s mind',
    hindiMeaning: 'हठी',
    synonyms: ['stubborn', 'obstinate', 'inflexible'],
    antonyms: ['yielding', 'flexible'],
    rootWord: 'durus (hard)',
    exampleSentence: 'The obdurate guard would not let anyone pass.',
    hinglishMnemonic: '"Ab Door Hat!" — a stubborn guard blocking everyone. Obdurate = stubborn.',
    englishMnemonic: 'OB-DURE — durable and hard, refuses to bend.',
    greFrequencyRank: 210,
  },
  {
    word: 'Ephemeral',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'lasting for a very short time',
    hindiMeaning: 'क्षणभंगुर',
    synonyms: ['fleeting', 'transient', 'momentary'],
    antonyms: ['permanent', 'enduring'],
    exampleSentence: 'Fame can be ephemeral.',
    hinglishMnemonic: '"A-FEMoral" — a moral you forget in a moment. Ephemeral = short-lived.',
    englishMnemonic: 'Like a mayfly (ephemera) that lives a single day.',
    greFrequencyRank: 85,
  },
  {
    word: 'Pragmatic',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'dealing with things practically',
    hindiMeaning: 'व्यावहारिक',
    synonyms: ['practical', 'realistic', 'sensible'],
    antonyms: ['idealistic', 'impractical'],
    exampleSentence: 'She took a pragmatic approach to the problem.',
    hinglishMnemonic: '"Practical + automatic" = pragmatic. Do what works.',
    englishMnemonic: 'A pragmatist cares about practice, not theory.',
    greFrequencyRank: 60,
  },
  {
    word: 'Ubiquitous',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'present everywhere',
    hindiMeaning: 'सर्वव्यापी',
    synonyms: ['omnipresent', 'pervasive', 'universal'],
    antonyms: ['rare', 'scarce'],
    exampleSentence: 'Smartphones are ubiquitous today.',
    hinglishMnemonic: '"You-be-quick-to-us" — everywhere you go, it’s already there.',
    englishMnemonic: 'Like ads on the internet — they are everywhere.',
    greFrequencyRank: 95,
  },
  {
    word: 'Capricious',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'given to sudden changes of mood',
    hindiMeaning: 'चंचल',
    synonyms: ['fickle', 'impulsive', 'mercurial'],
    antonyms: ['steady', 'constant'],
    exampleSentence: 'The weather here is capricious.',
    hinglishMnemonic:
      '"Car-precious" — a kid who suddenly wants a precious car, then changes his mind.',
    englishMnemonic: 'A capricious boss changes decisions like the wind.',
    greFrequencyRank: 150,
  },
  {
    word: 'Gregarious',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'fond of company; sociable',
    hindiMeaning: 'मिलनसार',
    synonyms: ['sociable', 'outgoing', 'convivial'],
    antonyms: ['reclusive', 'solitary'],
    rootWord: 'grex (flock)',
    exampleSentence: 'He is gregarious and loves parties.',
    hinglishMnemonic: '"Greg is various" friends — Greg is super social.',
    englishMnemonic: 'Gregarious animals move in a flock (grex).',
    greFrequencyRank: 130,
  },
  {
    word: 'Laconic',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'using very few words',
    hindiMeaning: 'अल्पभाषी',
    synonyms: ['terse', 'concise', 'succinct'],
    antonyms: ['verbose', 'wordy'],
    exampleSentence: 'His laconic reply was just "Fine."',
    hinglishMnemonic: '"La-konic" — lazy to speak, so uses few words.',
    englishMnemonic: 'The Spartans of Laconia were famous for short replies.',
    greFrequencyRank: 175,
  },
  {
    word: 'Mitigate',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.VERB,
    meaning: 'to make less severe',
    hindiMeaning: 'कम करना',
    synonyms: ['alleviate', 'lessen', 'ease'],
    antonyms: ['aggravate', 'intensify'],
    exampleSentence: 'Sandbags mitigate flood damage.',
    hinglishMnemonic: '"My-tea-gate" — a cup of tea at the gate calms (mitigates) your anger.',
    englishMnemonic: 'Mitigate softens, like a mitten softens a punch.',
    greFrequencyRank: 70,
  },
  {
    word: 'Pernicious',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    meaning: 'having a harmful effect, especially gradually',
    hindiMeaning: 'हानिकारक',
    synonyms: ['harmful', 'destructive', 'insidious'],
    antonyms: ['harmless', 'beneficial'],
    exampleSentence: 'Rumors had a pernicious effect on morale.',
    hinglishMnemonic: '"Per-nicious" — sounds like "vicious" per day, slowly harmful.',
    englishMnemonic: 'Pernicious harm creeps in quietly, like rust.',
    greFrequencyRank: 160,
  },
  {
    word: 'Sycophant',
    difficulty: Difficulty.HARD,
    partOfSpeech: PartOfSpeech.NOUN,
    meaning: 'a person who flatters to gain advantage',
    hindiMeaning: 'चापलूस',
    synonyms: ['flatterer', 'yes-man', 'bootlicker'],
    antonyms: ['critic'],
    exampleSentence: 'The king was surrounded by sycophants.',
    hinglishMnemonic: '"Sick-o-fan" — a sick fan who praises you nonstop for favors.',
    englishMnemonic: 'A sycophant sucks up to the powerful.',
    greFrequencyRank: 190,
  },
  {
    word: 'Venerate',
    difficulty: Difficulty.MEDIUM,
    partOfSpeech: PartOfSpeech.VERB,
    meaning: 'to regard with great respect',
    hindiMeaning: 'श्रद्धा करना',
    synonyms: ['revere', 'honor', 'esteem'],
    antonyms: ['despise', 'scorn'],
    rootWord: 'venerari (to worship)',
    exampleSentence: 'Many venerate their teachers.',
    hinglishMnemonic: '"Veneration = veteran + rate" — we rate veterans highly, with respect.',
    englishMnemonic: 'To venerate is to treat someone as venerable.',
    greFrequencyRank: 140,
  },
];

async function seedExams(): Promise<Map<ExamType, string>> {
  const ids = new Map<ExamType, string>();
  for (const exam of EXAMS) {
    const record = await prisma.exam.upsert({
      where: { type: exam.type },
      update: { name: exam.name, description: exam.description },
      create: {
        type: exam.type,
        name: exam.name,
        slug: slugify(exam.name),
        description: exam.description,
      },
    });
    ids.set(exam.type, record.id);
  }
  console.log(`✓ Seeded ${EXAMS.length} exams`);
  return ids;
}

async function seedBadges(): Promise<void> {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        description: badge.description,
        tier: badge.tier,
        criteria: badge.criteria,
      },
      create: {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        tier: badge.tier,
        criteria: badge.criteria,
      },
    });
  }
  console.log(`✓ Seeded ${BADGES.length} badges`);
}

async function seedWords(greExamId: string): Promise<void> {
  for (const w of WORDS) {
    const slug = slugify(w.word);
    const word = await prisma.word.upsert({
      where: { slug },
      update: {
        meaning: w.meaning,
        hindiMeaning: w.hindiMeaning,
        synonyms: w.synonyms,
        antonyms: w.antonyms,
        hinglishMnemonic: w.hinglishMnemonic,
        englishMnemonic: w.englishMnemonic,
        status: 'PUBLISHED',
      },
      create: {
        word: w.word,
        slug,
        difficulty: w.difficulty,
        partOfSpeech: w.partOfSpeech,
        meaning: w.meaning,
        hindiMeaning: w.hindiMeaning,
        synonyms: w.synonyms,
        antonyms: w.antonyms,
        rootWord: w.rootWord ?? null,
        exampleSentence: w.exampleSentence,
        hinglishMnemonic: w.hinglishMnemonic,
        englishMnemonic: w.englishMnemonic,
        frequency: w.greFrequencyRank,
        status: 'PUBLISHED',
      },
    });

    await prisma.wordExam.upsert({
      where: { wordId_examId: { wordId: word.id, examId: greExamId } },
      update: { frequencyRank: w.greFrequencyRank, isHighFrequency: w.greFrequencyRank <= 300 },
      create: {
        wordId: word.id,
        examId: greExamId,
        frequencyRank: w.greFrequencyRank,
        isHighFrequency: w.greFrequencyRank <= 300,
      },
    });
  }
  console.log(`✓ Seeded ${WORDS.length} GRE words`);
}

async function main(): Promise<void> {
  console.log('Seeding database...');
  const examIds = await seedExams();
  await seedBadges();
  const greExamId = examIds.get(ExamType.GRE);
  if (greExamId) await seedWords(greExamId);
  console.log('Seed complete.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
