import type { BillingGateway } from '../application/billing-gateway.port.js';

/** Demo gateway: never creates a hosted session, so the caller upgrades locally. */
export class StubBillingGateway implements BillingGateway {
  async createCheckoutUrl(): Promise<string | null> {
    return null;
  }
}
