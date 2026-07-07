import type { AiUsage } from './provider/ai-provider.js';

/** Base error for the AI package. */
export class AiError extends Error {
  readonly provider?: string;
  readonly status?: number;

  constructor(
    message: string,
    options: { provider?: string; status?: number; cause?: unknown } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.provider = options.provider;
    this.status = options.status;
  }
}

/** Raised when the model output cannot be parsed/validated into the expected shape. */
export class AiParseError extends AiError {
  readonly raw: string;
  readonly usage?: AiUsage;

  constructor(message: string, details: { raw: string; usage?: AiUsage }) {
    super(message);
    this.raw = details.raw;
    this.usage = details.usage;
  }
}
