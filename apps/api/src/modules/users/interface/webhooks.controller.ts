import type { Request, Response } from 'express';
import { AppError } from '../../../shared/http/http-error.js';
import type { WebhookVerifier } from '../../auth/webhook-verifier.port.js';
import type { SyncClerkUserUseCase } from '../application/sync-clerk-user.usecase.js';

function rawBody(req: Request): string {
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body ?? {});
}

function headerRecord(req: Request): Record<string, string | undefined> {
  const record: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    record[key] = Array.isArray(value) ? value[0] : value;
  }
  return record;
}

/** Handles signed Clerk webhooks to keep the local user store in sync. */
export class WebhooksController {
  constructor(
    private readonly verifier: WebhookVerifier,
    private readonly sync: SyncClerkUserUseCase,
  ) {}

  clerk = async (req: Request, res: Response): Promise<void> => {
    const event = this.verifier.verify(rawBody(req), headerRecord(req));
    if (!event) throw AppError.unauthorized('Invalid webhook signature');
    await this.sync.execute(event);
    res.status(200).json({ received: true });
  };
}
