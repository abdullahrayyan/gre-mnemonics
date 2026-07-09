/** Port for the payment provider (Stripe in prod, a stub in the demo). */
export interface BillingGateway {
  /**
   * Create a hosted checkout URL for the plan. Returns `null` when billing runs
   * in demo/stub mode, signalling the caller to upgrade the plan immediately.
   */
  createCheckoutUrl(input: {
    userId: string;
    email?: string;
    plan: string;
  }): Promise<string | null>;
}
