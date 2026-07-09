import { describe, expect, it } from 'vitest';
import { StubAiProvider } from '../provider/stub-provider.js';
import { TutorEngine } from './tutor.engine.js';

async function collect(iter: AsyncIterable<string>): Promise<string> {
  let out = '';
  for await (const token of iter) out += token;
  return out;
}

describe('TutorEngine', () => {
  it('streams the reply as tokens', async () => {
    const engine = new TutorEngine(new StubAiProvider('Bolster means to support.'), {
      model: 'gpt-4o-mini',
    });
    const text = await collect(
      engine.stream({ messages: [{ role: 'user', content: 'explain bolster' }] }),
    );
    expect(text).toBe('Bolster means to support.');
  });

  it('supports non-streaming chat', async () => {
    const engine = new TutorEngine(new StubAiProvider('Here is a mnemonic.'));
    const result = await engine.chat({ word: 'bolster', action: 'ANOTHER_MNEMONIC', messages: [] });
    expect(result.content).toBe('Here is a mnemonic.');
  });

  it('exposes its model', () => {
    expect(new TutorEngine(new StubAiProvider(''), { model: 'gpt-4o' }).model).toBe('gpt-4o');
  });
});
