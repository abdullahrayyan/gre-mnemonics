import express, { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { WebhooksController } from './webhooks.controller.js';

/**
 * Webhook router. Uses a raw body parser (signature verification needs the exact
 * bytes) — mount this BEFORE the global JSON parser.
 */
export function createWebhooksRouter(container: Container): Router {
  const controller = new WebhooksController(container.webhookVerifier, container.users.syncUser);
  const router = Router();

  router.post('/clerk', express.raw({ type: '*/*', limit: '1mb' }), asyncHandler(controller.clerk));

  return router;
}
