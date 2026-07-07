export interface ClerkWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

/**
 * Port for verifying + parsing a signed Clerk webhook. The svix adapter checks
 * the signature; a stub is injected in tests. Returns `null` on invalid signatures.
 */
export interface WebhookVerifier {
  verify(payload: string, headers: Record<string, string | undefined>): ClerkWebhookEvent | null;
}
