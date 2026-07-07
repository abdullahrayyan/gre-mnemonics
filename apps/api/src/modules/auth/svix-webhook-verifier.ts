import { Webhook } from 'svix';
import { logger } from '../../shared/logger.js';
import type { ClerkWebhookEvent, WebhookVerifier } from './webhook-verifier.port.js';

/** Verifies Clerk webhooks using svix signatures over the raw request body. */
export class SvixWebhookVerifier implements WebhookVerifier {
  private readonly webhook: Webhook;

  constructor(secret: string) {
    this.webhook = new Webhook(secret);
  }

  verify(payload: string, headers: Record<string, string | undefined>): ClerkWebhookEvent | null {
    try {
      return this.webhook.verify(payload, {
        'svix-id': headers['svix-id'] ?? '',
        'svix-timestamp': headers['svix-timestamp'] ?? '',
        'svix-signature': headers['svix-signature'] ?? '',
      }) as ClerkWebhookEvent;
    } catch (err) {
      logger.warn({ err }, 'Clerk webhook signature verification failed');
      return null;
    }
  }
}
