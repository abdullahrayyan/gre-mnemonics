import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type { AnalyticsEventInput, AnalyticsRecorder } from './analytics-recorder.port.js';

export class PrismaAnalyticsRecorder implements AnalyticsRecorder {
  constructor(private readonly prisma: PrismaClient) {}

  async record(input: AnalyticsEventInput): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        name: input.name,
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        ...(input.properties !== undefined
          ? { properties: input.properties as Prisma.InputJsonValue }
          : {}),
      },
    });
  }
}

/** No-op recorder for tests / when analytics is disabled. */
export class NoopAnalyticsRecorder implements AnalyticsRecorder {
  async record(): Promise<void> {
    // intentionally does nothing
  }
}
