/* eslint-disable no-console */
// Compare mnemonic quality across models: node --import tsx scripts/test-model.ts <model> <words...>
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MnemonicEngine, OpenAiProvider } from '@mnemonic/ai';
import { config as loadEnv } from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '../.env') });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY missing');

const model = process.argv[2]!;
const words = process.argv.slice(3);
const engine = new MnemonicEngine(new OpenAiProvider({ apiKey, defaultModel: model }), { model });

console.log(`\n=========== ${model} ===========`);
for (const word of words) {
  try {
    const r = await engine.generateWord(word, { examType: 'GRE' });
    console.log(`\n■ ${word} (${r.data.hindiMeaning})`);
    console.log(`   EN: ${r.data.englishMnemonic}`);
    console.log(`   HI: ${r.data.hinglishMnemonic}`);
  } catch (error) {
    console.log(`\n■ ${word} -> FAILED: ${(error as Error).message}`);
  }
}
