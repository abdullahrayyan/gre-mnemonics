/**
 * @mnemonic/ai — the AI mnemonic engine.
 * A vendor-neutral provider port with an OpenAI adapter, prompt templates, and
 * an engine that generates the full set of learning artifacts as validated,
 * cacheable structured output. Contains no database or HTTP concerns.
 */
export { AiError, AiParseError } from './errors.js';
export { estimateCostCents } from './cost.js';

export type {
  AiProvider,
  AiMessage,
  AiRole,
  AiCompletion,
  AiCompletionRequest,
  AiUsage,
} from './provider/ai-provider.js';
export { emptyUsage } from './provider/ai-provider.js';
export { OpenAiProvider, type OpenAiProviderOptions } from './provider/openai-provider.js';
export { StubAiProvider } from './provider/stub-provider.js';

export { type GenerationCache, InMemoryGenerationCache } from './cache/generation-cache.js';

export {
  buildMnemonicMessages,
  buildWordMessages,
  MNEMONIC_PROMPT_VERSION,
  WORD_PROMPT_VERSION,
} from './prompts/mnemonic.prompt.js';

export {
  MnemonicEngine,
  type GenerationResult,
  type MnemonicEngineOptions,
} from './mnemonic/mnemonic.engine.js';
export {
  generatedMnemonicSetSchema,
  generatedQuizQuestionSchema,
  generatedWordSchema,
  QUIZ_QUESTION_KINDS,
  type GeneratedMnemonicSet,
  type GeneratedQuizQuestion,
  type GeneratedWord,
  type QuizQuestionKind,
  type MnemonicRequest,
} from './mnemonic/mnemonic.types.js';
