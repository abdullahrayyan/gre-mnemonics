import type { AiCompletion, AiProvider } from '../provider/ai-provider.js';
import { buildTutorMessages, type TutorRequest } from './tutor.prompt.js';

export interface TutorEngineOptions {
  model?: string;
  temperature?: number;
}

/** Streaming/non-streaming tutor chat over the provider port. */
export class TutorEngine {
  constructor(
    private readonly provider: AiProvider,
    private readonly options: TutorEngineOptions = {},
  ) {}

  get model(): string {
    return this.options.model ?? this.provider.name;
  }

  /** Stream the tutor's reply as content deltas. */
  stream(request: TutorRequest): AsyncIterable<string> {
    return this.provider.stream({
      messages: buildTutorMessages(request),
      model: this.options.model,
      temperature: this.options.temperature ?? 0.7,
    });
  }

  /** Non-streaming reply (used in tests and non-SSE clients). */
  chat(request: TutorRequest): Promise<AiCompletion> {
    return this.provider.complete({
      messages: buildTutorMessages(request),
      model: this.options.model,
      temperature: this.options.temperature ?? 0.7,
    });
  }
}
