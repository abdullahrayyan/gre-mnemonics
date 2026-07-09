import type { AuthClaims, AuthVerifier } from './auth-verifier.port.js';

/**
 * Demo verifier: accepts ANY bearer token and resolves it to a single seeded
 * demo user. Used only by the zero-infra demo server so the web app (which has
 * no real Clerk session) can exercise every authenticated endpoint. Never wired
 * into the production container.
 */
export class DemoAuthVerifier implements AuthVerifier {
  constructor(private readonly clerkUserId: string) {}

  async verify(_token: string): Promise<AuthClaims> {
    return { clerkUserId: this.clerkUserId };
  }
}
