import { User, type UserRepository } from '@mnemonic/core';
import type { ClerkWebhookEvent } from '../../auth/webhook-verifier.port.js';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

function extractPrimaryEmail(data: Record<string, unknown>): string | null {
  const addresses = (data.email_addresses as ClerkEmailAddress[] | undefined) ?? [];
  if (addresses.length === 0) return null;
  const primaryId = data.primary_email_address_id as string | undefined;
  const primary = addresses.find((a) => a.id === primaryId) ?? addresses[0];
  return primary?.email_address ?? null;
}

/**
 * Reconcile the local user store with Clerk webhook events
 * (`user.created` / `user.updated` / `user.deleted`). Idempotent.
 */
export class SyncClerkUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly generateId: () => string,
  ) {}

  async execute(event: ClerkWebhookEvent): Promise<void> {
    const clerkId = event.data.id as string | undefined;
    if (!clerkId) return;

    if (event.type === 'user.deleted') {
      await this.users.deleteByClerkId(clerkId);
      return;
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const email = extractPrimaryEmail(event.data) ?? `${clerkId}@no-email.local`;
      const existing = await this.users.findByClerkId(clerkId);

      if (existing) {
        if (existing.email !== email.toLowerCase()) existing.changeEmail(email);
        await this.users.update(existing);
        return;
      }

      const user = User.create({ clerkId, email }, { id: this.generateId() });
      await this.users.create(user);
    }
  }
}
