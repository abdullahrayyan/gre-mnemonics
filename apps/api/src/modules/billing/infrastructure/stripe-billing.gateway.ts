import type { BillingGateway } from '../application/billing-gateway.port.js';

export interface StripeGatewayOptions {
  secretKey: string;
  priceByPlan: Record<string, string | undefined>;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Stripe adapter using the REST API directly (no SDK dependency). Creates a
 * hosted Checkout Session for the requested plan and returns its URL. Active
 * only when STRIPE_SECRET_KEY is configured.
 */
export class StripeBillingGateway implements BillingGateway {
  constructor(private readonly options: StripeGatewayOptions) {}

  async createCheckoutUrl(input: {
    userId: string;
    email?: string;
    plan: string;
  }): Promise<string | null> {
    const price = this.options.priceByPlan[input.plan];
    if (!price) throw new Error(`No Stripe price id configured for plan ${input.plan}`);

    const form = new URLSearchParams();
    form.set('mode', 'subscription');
    form.set('success_url', this.options.successUrl);
    form.set('cancel_url', this.options.cancelUrl);
    form.set('line_items[0][price]', price);
    form.set('line_items[0][quantity]', '1');
    form.set('client_reference_id', input.userId);
    form.set('metadata[plan]', input.plan);
    form.set('metadata[userId]', input.userId);
    if (input.email) form.set('customer_email', input.email);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    if (!response.ok) {
      throw new Error(`Stripe checkout session failed: ${response.status}`);
    }
    const json = (await response.json()) as { url?: string };
    return json.url ?? null;
  }
}
