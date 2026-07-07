import type { ClerkWebhookEvent, WebhookVerifier } from './webhook-verifier.port.js';

/** Test verifier: parses the JSON body without checking a signature. */
export class StubWebhookVerifier implements WebhookVerifier {
  verify(payload: string): ClerkWebhookEvent | null {
    try {
      const parsed = JSON.parse(payload) as ClerkWebhookEvent;
      return parsed.type ? parsed : null;
    } catch {
      return null;
    }
  }
}
