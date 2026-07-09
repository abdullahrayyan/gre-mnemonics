import { createHmac, timingSafeEqual } from 'node:crypto';
import express, { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { logger } from '../../../shared/logger.js';

/** Verify a Stripe webhook signature (`t=…,v1=…`) over the raw request body. */
function verifySignature(rawBody: Buffer, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(',').map((part) => part.split('=') as [string, string]),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

interface StripeSession {
  client_reference_id?: string;
  customer?: string;
  subscription?: string;
  metadata?: { plan?: string; userId?: string };
}

/**
 * Stripe webhook router (mounted at /api/webhooks, before the JSON parser, so the
 * raw body is available for signature verification). Applies plan changes on
 * `checkout.session.completed`. Inert until STRIPE_WEBHOOK_SECRET is configured.
 */
export function createStripeWebhookRouter(container: Container): Router {
  const router = Router();
  router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    asyncHandler(async (req, res) => {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        res.status(503).json({ error: { code: 'STRIPE_NOT_CONFIGURED', message: 'No webhook secret' } });
        return;
      }
      const signature = req.headers['stripe-signature'];
      const body = req.body as Buffer;
      if (typeof signature !== 'string' || !verifySignature(body, signature, secret)) {
        res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Bad signature' } });
        return;
      }

      const event = JSON.parse(body.toString('utf8')) as { type: string; data: { object: StripeSession } };
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await container.billing.applyPlan.execute(userId, plan, {
            stripeCustomerId: session.customer ?? null,
            stripeSubscriptionId: session.subscription ?? null,
          });
          logger.info({ userId, plan }, 'Applied plan from Stripe webhook');
        }
      }
      res.status(200).json({ received: true });
    }),
  );
  return router;
}
