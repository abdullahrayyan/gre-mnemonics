import OpenAI from 'openai';
import { AiError } from '../errors.js';
import type { AiCompletion, AiCompletionRequest, AiProvider } from './ai-provider.js';

export interface OpenAiProviderOptions {
  apiKey: string;
  defaultModel?: string;
  timeoutMs?: number;
  organization?: string;
  maxRetries?: number;
}

/**
 * OpenAI implementation of the {@link AiProvider} port. Thin adapter: it
 * translates the vendor-neutral request/response, measures latency, surfaces
 * token usage, and maps SDK errors to {@link AiError}. No prompt or business
 * logic lives here.
 */
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private readonly client: OpenAI;
  private readonly defaultModel: string;

  constructor(options: OpenAiProviderOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      timeout: options.timeoutMs ?? 60_000,
      maxRetries: options.maxRetries ?? 2,
      ...(options.organization ? { organization: options.organization } : {}),
    });
    this.defaultModel = options.defaultModel ?? 'gpt-4o-mini';
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    const model = request.model ?? this.defaultModel;
    const startedAt = Date.now();

    try {
      const response = await this.client.chat.completions.create(
        {
          model,
          messages: request.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          temperature: request.temperature ?? 0.8,
          ...(request.maxTokens ? { max_tokens: request.maxTokens } : {}),
          ...(request.responseFormat === 'json'
            ? { response_format: { type: 'json_object' as const } }
            : {}),
        },
        { signal: request.signal },
      );

      const latencyMs = Date.now() - startedAt;
      const content = response.choices[0]?.message?.content ?? '';
      const usage = response.usage;

      return {
        content,
        usage: {
          model: response.model ?? model,
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          totalTokens: usage?.total_tokens ?? 0,
          latencyMs,
        },
      };
    } catch (error) {
      throw this.mapError(error, model);
    }
  }

  private mapError(error: unknown, model: string): AiError {
    if (error instanceof OpenAI.APIError) {
      return new AiError(`OpenAI request failed for model "${model}": ${error.message}`, {
        provider: this.name,
        status: error.status,
        cause: error,
      });
    }
    return new AiError(`OpenAI request failed for model "${model}"`, {
      provider: this.name,
      cause: error,
    });
  }
}
