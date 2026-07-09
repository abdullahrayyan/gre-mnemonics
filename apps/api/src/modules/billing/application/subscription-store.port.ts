import type { SubscriptionDto } from '@mnemonic/types';

export interface SetPlanOptions {
  status?: string;
  currentPeriodEnd?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

/** Persistence port for a user's subscription. */
export interface SubscriptionStore {
  getByUser(userId: string): Promise<SubscriptionDto>;
  setPlan(userId: string, plan: string, options?: SetPlanOptions): Promise<SubscriptionDto>;
}
