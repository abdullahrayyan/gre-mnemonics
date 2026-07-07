/** Claims extracted from a verified session token. */
export interface AuthClaims {
  clerkUserId: string;
  sessionId?: string;
}

/**
 * Port for verifying a bearer session token. The Clerk adapter verifies real
 * tokens; a stub is injected in tests. Returns `null` for invalid/expired tokens.
 */
export interface AuthVerifier {
  verify(token: string): Promise<AuthClaims | null>;
}
