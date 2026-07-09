import { SubscriptionPlan } from '@mnemonic/core';
import { z } from 'zod';

/** Body for starting checkout / upgrading to a paid plan. */
export const checkoutSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan),
});
export type CheckoutDto = z.infer<typeof checkoutSchema>;
