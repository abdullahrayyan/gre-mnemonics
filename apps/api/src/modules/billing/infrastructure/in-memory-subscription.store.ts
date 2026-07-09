import type { SubscriptionDto } from '@mnemonic/types';
import type { SetPlanOptions, SubscriptionStore } from '../application/subscription-store.port.js';

const FREE: SubscriptionDto = {
  plan: 'FREE',
  status: 'ACTIVE',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/** In-memory subscription store for tests + the demo. */
export class InMemorySubscriptionStore implements SubscriptionStore {
  private readonly byUser = new Map<string, SubscriptionDto>();

  async getByUser(userId: string): Promise<SubscriptionDto> {
    return this.byUser.get(userId) ?? FREE;
  }

  async setPlan(userId: string, plan: string, options?: SetPlanOptions): Promise<SubscriptionDto> {
    const record: SubscriptionDto = {
      plan,
      status: options?.status ?? 'ACTIVE',
      currentPeriodEnd: (options?.currentPeriodEnd ?? null)?.toISOString() ?? null,
      cancelAtPeriodEnd: false,
    };
    this.byUser.set(userId, record);
    return record;
  }
}
