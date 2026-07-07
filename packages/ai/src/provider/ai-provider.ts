export type AiRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
  /** Model override; when omitted the provider uses its configured default. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Request strict JSON output when supported by the provider. */
  responseFormat?: 'text' | 'json';
  signal?: AbortSignal;
}

export interface AiUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface AiCompletion {
  content: string;
  usage: AiUsage;
}

/**
 * Provider port: the LLM abstraction the engine depends on. Any backend
 * (OpenAI, a stub, a future local model) implements this, keeping the
 * application logic vendor-agnostic and unit-testable without a network.
 */
export interface AiProvider {
  readonly name: string;
  complete(request: AiCompletionRequest): Promise<AiCompletion>;
}

/** Build an {@link AiUsage} with zeroed counters (e.g. for cache hits). */
export function emptyUsage(model: string): AiUsage {
  return { model, promptTokens: 0, completionTokens: 0, totalTokens: 0, latencyMs: 0 };
}
