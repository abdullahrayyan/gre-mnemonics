export type AiHistoryStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL';

export interface AiHistoryEntry {
  wordId?: string | null;
  userId?: string | null;
  /** Matches DB `AiGenerationType` (e.g. `MNEMONIC_SET`). */
  type: string;
  model: string;
  prompt: string;
  response?: unknown;
  promptTokens?: number;
  completionTokens?: number;
  costCents?: number;
  latencyMs?: number;
  status?: AiHistoryStatus;
  error?: string;
}

/**
 * Port for recording AI generations (audit + cost tracking). The engine stays
 * DB-free; use-cases persist history through this port, implemented by
 * infrastructure with Prisma.
 */
export interface AiHistoryRecorder {
  record(entry: AiHistoryEntry): Promise<void>;
}
