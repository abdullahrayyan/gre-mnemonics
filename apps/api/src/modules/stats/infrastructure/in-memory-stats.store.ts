import type { RawStats, StatsStore } from '../application/stats-store.port.js';

/** In-memory stats store for tests — returns fixed aggregates. */
export class InMemoryStatsStore implements StatsStore {
  constructor(private readonly stats: RawStats) {}

  async getRawStats(): Promise<RawStats> {
    return this.stats;
  }
}
