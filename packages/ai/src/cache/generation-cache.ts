/**
 * Cache port for AI generations. Keyed by a stable hash of (prompt version,
 * model, word). A Redis-backed implementation ships with the API (Phase 3); the
 * in-memory version below is for tests and single-process use.
 */
export interface GenerationCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

/** Simple in-process cache with optional TTL. Not shared across instances. */
export class InMemoryGenerationCache implements GenerationCache {
  private readonly store = new Map<string, CacheEntry>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? this.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  get size(): number {
    return this.store.size;
  }
}
