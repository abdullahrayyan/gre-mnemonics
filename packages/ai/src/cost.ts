import type { AiUsage } from './provider/ai-provider.js';

interface ModelPrice {
  /** USD per 1M input tokens. */
  inputPerMillion: number;
  /** USD per 1M output tokens. */
  outputPerMillion: number;
}

// Indicative prices (USD / 1M tokens). Update as pricing changes; unknown models
// fall back to the default so cost tracking degrades gracefully.
const PRICES: Record<string, ModelPrice> = {
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10 },
  'gpt-4.1-mini': { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  'gpt-4.1': { inputPerMillion: 2, outputPerMillion: 8 },
};

const DEFAULT_PRICE: ModelPrice = PRICES['gpt-4o-mini']!;

function priceFor(model: string): ModelPrice {
  if (PRICES[model]) return PRICES[model];
  // Match on a known family prefix (e.g. "gpt-4o-mini-2024-07-18").
  for (const [key, price] of Object.entries(PRICES)) {
    if (model.startsWith(key)) return price;
  }
  return DEFAULT_PRICE;
}

/** Estimated cost of a generation, in integer cents (rounded up). */
export function estimateCostCents(usage: AiUsage): number {
  const price = priceFor(usage.model);
  const dollars =
    (usage.promptTokens / 1_000_000) * price.inputPerMillion +
    (usage.completionTokens / 1_000_000) * price.outputPerMillion;
  return Math.ceil(dollars * 100);
}
