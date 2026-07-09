import { SubscriptionPlan, type UserRepository } from '@mnemonic/core';
import type { CheckoutResultDto, PlanInfo, SubscriptionDto } from '@mnemonic/types';
import type { BillingGateway } from './billing-gateway.port.js';
import type { SubscriptionStore } from './subscription-store.port.js';

/** Public pricing catalog shown on the pricing page. */
export const PLAN_CATALOG: PlanInfo[] = [
  {
    plan: 'FREE',
    name: 'Free',
    priceCents: 0,
    features: ['1,000+ GRE words', 'Spaced repetition', 'Quizzes', 'Community'],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    priceCents: 499,
    features: ['Everything in Free', 'Unlimited AI tutor', 'AI mnemonic regeneration', 'Advanced stats'],
  },
  {
    plan: 'PREMIUM',
    name: 'Premium',
    priceCents: 999,
    features: ['Everything in Pro', 'Memory-palace generator', 'OCR / PDF import', 'Priority AI'],
  },
];

export class GetSubscriptionUseCase {
  constructor(private readonly store: SubscriptionStore) {}
  execute(userId: string): Promise<SubscriptionDto> {
    return this.store.getByUser(userId);
  }
}

export class ListPlansUseCase {
  execute(): PlanInfo[] {
    return PLAN_CATALOG;
  }
}

/** Start checkout: hand off to Stripe, or upgrade instantly in demo/stub mode. */
export class StartCheckoutUseCase {
  constructor(
    private readonly store: SubscriptionStore,
    private readonly gateway: BillingGateway,
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string, plan: string): Promise<CheckoutResultDto> {
    if (plan === SubscriptionPlan.FREE) {
      await this.store.setPlan(userId, SubscriptionPlan.FREE);
      return { url: null, plan, upgraded: true };
    }
    const user = await this.users.findById(userId);
    const url = await this.gateway.createCheckoutUrl({ userId, email: user?.email, plan });
    if (url) return { url, plan, upgraded: false };
    // No real gateway configured → instant upgrade (demo).
    await this.store.setPlan(userId, plan);
    return { url: null, plan, upgraded: true };
  }
}

/** Apply a plan change from a verified Stripe webhook event. */
export class ApplyPlanUseCase {
  constructor(private readonly store: SubscriptionStore) {}
  execute(
    userId: string,
    plan: string,
    options?: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null },
  ): Promise<SubscriptionDto> {
    return this.store.setPlan(userId, plan, options);
  }
}
