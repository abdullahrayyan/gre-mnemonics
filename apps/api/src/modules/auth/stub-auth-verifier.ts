import type { AuthClaims, AuthVerifier } from './auth-verifier.port.js';

/**
 * Deterministic verifier for tests. Maps opaque tokens to claims via a table;
 * unknown tokens are rejected (return `null`).
 */
export class StubAuthVerifier implements AuthVerifier {
  constructor(private readonly tokens: Record<string, AuthClaims> = {}) {}

  set(token: string, claims: AuthClaims): void {
    this.tokens[token] = claims;
  }

  async verify(token: string): Promise<AuthClaims | null> {
    return this.tokens[token] ?? null;
  }
}
