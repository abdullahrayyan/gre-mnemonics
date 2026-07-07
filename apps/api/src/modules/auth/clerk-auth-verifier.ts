import { verifyToken } from '@clerk/backend';
import { logger } from '../../shared/logger.js';
import type { AuthClaims, AuthVerifier } from './auth-verifier.port.js';

/** Verifies Clerk session JWTs using the Clerk backend SDK. */
export class ClerkAuthVerifier implements AuthVerifier {
  constructor(private readonly secretKey: string) {}

  async verify(token: string): Promise<AuthClaims | null> {
    try {
      const payload = await verifyToken(token, { secretKey: this.secretKey });
      if (!payload.sub) return null;
      return { clerkUserId: payload.sub, sessionId: payload.sid };
    } catch (err) {
      logger.debug({ err }, 'Clerk token verification failed');
      return null;
    }
  }
}
