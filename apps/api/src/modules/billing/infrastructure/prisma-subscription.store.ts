import type { PrismaClient } from '@mnemonic/database';
import type { SubscriptionDto } from '@mnemonic/types';
import type { SetPlanOptions, SubscriptionStore } from '../application/subscription-store.port.js';

type Row = {
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

const toDto = (row: Row | null): SubscriptionDto =>
  row
    ? {
        plan: row.plan,
        status: row.status,
        currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      }
    : { plan: 'FREE', status: 'ACTIVE', currentPeriodEnd: null, cancelAtPeriodEnd: false };

/** Prisma-backed subscription store. */
export class PrismaSubscriptionStore implements SubscriptionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async getByUser(userId: string): Promise<SubscriptionDto> {
    return toDto(await this.prisma.subscription.findUnique({ where: { userId } }));
  }

  async setPlan(userId: string, plan: string, options?: SetPlanOptions): Promise<SubscriptionDto> {
    const data = {
      plan: plan as never,
      status: (options?.status ?? 'ACTIVE') as never,
      currentPeriodEnd: options?.currentPeriodEnd ?? null,
      ...(options?.stripeCustomerId ? { stripeCustomerId: options.stripeCustomerId } : {}),
      ...(options?.stripeSubscriptionId ? { stripeSubscriptionId: options.stripeSubscriptionId } : {}),
    };
    const row = await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return toDto(row);
  }
}
