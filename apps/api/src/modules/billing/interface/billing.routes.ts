import { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import { BillingController } from './billing.controller.js';

/** `/billing` router — plans (public), subscription + checkout (auth). */
export function createBillingRouter(container: Container, auth: AuthMiddleware): Router {
  const b = container.billing;
  const controller = new BillingController(b.getSubscription, b.listPlans, b.startCheckout);
  const router = Router();

  router.get('/plans', asyncHandler(controller.plans));
  router.get('/subscription', auth.requireAuth, asyncHandler(controller.subscription));
  router.post('/checkout', auth.requireAuth, asyncHandler(controller.checkout));

  return router;
}
