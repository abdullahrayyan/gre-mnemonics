import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type { AiHistoryEntry, AiHistoryRecorder } from '../application/ai-history.port.js';

/** Persists AI generations to the `AiHistory` table for audit + cost tracking. */
export class PrismaAiHistoryRecorder implements AiHistoryRecorder {
  constructor(private readonly prisma: PrismaClient) {}

  async record(entry: AiHistoryEntry): Promise<void> {
    await this.prisma.aiHistory.create({
      data: {
        wordId: entry.wordId ?? null,
        userId: entry.userId ?? null,
        type: entry.type as Prisma.AiHistoryUncheckedCreateInput['type'],
        model: entry.model,
        prompt: entry.prompt,
        promptTokens: entry.promptTokens,
        completionTokens: entry.completionTokens,
        costCents: entry.costCents,
        latencyMs: entry.latencyMs,
        status: (entry.status ?? 'SUCCESS') as Prisma.AiHistoryUncheckedCreateInput['status'],
        error: entry.error,
        ...(entry.response !== undefined
          ? { response: entry.response as Prisma.InputJsonValue }
          : {}),
      },
    });
  }
}

/** No-op recorder for tests / when history persistence is disabled. */
export class NoopAiHistoryRecorder implements AiHistoryRecorder {
  async record(): Promise<void> {
    // intentionally does nothing
  }
}
