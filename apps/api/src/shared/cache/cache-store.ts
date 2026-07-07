/**
 * Key/value cache port. A Redis-backed store is used in production; an in-memory
 * store powers tests and single-process/no-Redis setups. Callers treat the cache
 * as best-effort — a miss or failure must never break a request.
 */
export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

interface Entry {
  value: string;
  expiresAt: number | null;
}

/** In-process cache with optional TTL. */
export class InMemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, Entry>();

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

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
