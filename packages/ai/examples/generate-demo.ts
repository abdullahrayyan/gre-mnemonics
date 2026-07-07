/* eslint-disable no-console */
/**
 * Offline demonstration of the mnemonic engine using the stub provider — runs
 * the full pipeline (prompt → provider → JSON parse → validation → mapping)
 * without an API key. Run with: `pnpm --filter @mnemonic/ai demo`.
 *
 * To run against real OpenAI, swap `StubAiProvider` for:
 *   new OpenAiProvider({ apiKey: process.env.OPENAI_API_KEY!, defaultModel: 'gpt-4o-mini' })
 */
import { MnemonicEngine, StubAiProvider } from '../src/index.js';

// A representative model response for the word "Obdurate".
const STUB_RESPONSE = JSON.stringify({
  hinglishMnemonic:
    '"Ab Door Hat!" — a stubborn guard shouting, refusing to move. Obdurate = stubborn.',
  englishMnemonic: 'OB-DURE: think "durable + hard" — too hard to bend.',
  story:
    'A guard named Ob stood at the gate. Everyone begged, "Please!" He only barked, "Ab door hat!" — utterly unmoved.',
  beginnerExplanation: 'Obdurate means very stubborn and unwilling to change your mind.',
  hindiExplanation: 'ऑब्ड्यूरेट का अर्थ है हठी — जो किसी भी हाल में अपनी बात नहीं बदलता।',
  rootExplanation:
    'From Latin "obdurare" (ob- = against, durus = hard) — hardened against persuasion.',
  realLifeExample: 'Despite every argument, the obdurate manager refused to change the deadline.',
  visualImagination:
    'A giant, unmovable stone guard blocking a doorway while a crowd pushes in vain.',
  memoryTrick: 'Obdurate has "dur" (durable/hard) inside — a hard, unbending person.',
  imagePrompt:
    'A stern stone-faced security guard with folded arms blocking a doorway, a frustrated crowd in front, dramatic lighting.',
  quizQuestions: [
    {
      type: 'WORD_TO_MEANING',
      prompt: 'What does "obdurate" mean?',
      options: ['stubborn', 'generous', 'cheerful', 'fragile'],
      correctAnswer: 'stubborn',
      explanation: 'Obdurate = stubbornly refusing to change.',
    },
    {
      type: 'ANTONYM',
      prompt: 'Which word is the OPPOSITE of "obdurate"?',
      options: ['yielding', 'rigid', 'harsh', 'firm'],
      correctAnswer: 'yielding',
      explanation: 'Yielding/flexible is the opposite of stubborn.',
    },
  ],
});

async function main(): Promise<void> {
  const engine = new MnemonicEngine(new StubAiProvider(STUB_RESPONSE), { model: 'gpt-4o-mini' });

  const result = await engine.generateMnemonicSet({
    word: 'Obdurate',
    meaning: 'stubbornly refusing to change one’s mind',
    partOfSpeech: 'ADJECTIVE',
    examType: 'GRE',
  });

  console.log(`\nGenerated ${Object.keys(result.data).length} artifact groups:`);
  console.log(Object.keys(result.data).join(', '));
  console.log('\n— Full artifact set —');
  console.log(JSON.stringify(result.data, null, 2));
  console.log('\n— Mapped onto domain WordAiContent —');
  console.log(JSON.stringify(engine.toWordAiContent(result.data), null, 2));
  console.log(
    `\nModel: ${result.model} · cached: ${result.cached} · tokens: ${result.usage.totalTokens}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
