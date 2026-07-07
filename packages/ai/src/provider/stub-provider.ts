import type { AiCompletion, AiCompletionRequest, AiProvider } from './ai-provider.js';

/**
 * Deterministic provider for tests and offline development. Returns queued
 * responses in order (repeating the last), and records how many times it was
 * called so tests can assert caching/retry behavior without a network.
 */
export class StubAiProvider implements AiProvider {
  readonly name = 'stub';
  private readonly responses: string[];
  public calls = 0;

  constructor(responses: string | string[]) {
    this.responses = Array.isArray(responses) ? responses : [responses];
    if (this.responses.length === 0) this.responses.push('');
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    const index = Math.min(this.calls, this.responses.length - 1);
    const content = this.responses[index] ?? '';
    this.calls += 1;
    return {
      content,
      usage: {
        model: request.model ?? 'stub-model',
        promptTokens: 12,
        completionTokens: 34,
        totalTokens: 46,
        latencyMs: 0,
      },
    };
  }
}
