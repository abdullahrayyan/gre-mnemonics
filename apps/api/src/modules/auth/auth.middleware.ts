import type { SubscriptionPlan, UserRole } from '@mnemonic/core';
import type { Request } from 'express';
import type { Container } from '../../container/container.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { AppError } from '../../shared/http/http-error.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; clerkId: string; role: UserRole };
    }
  }
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['ACTIVE', 'TRIALING']);

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!token || scheme?.toLowerCase() !== 'bearer') return null;
  return token.trim();
}

/**
 * Authenticate the request: verify the bearer token, resolve the app user, and
 * attach `req.auth`. Throws {@link AppError} (401/403) on failure.
 */
async function authenticate(container: Container, req: Request): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) throw AppError.unauthorized('Missing bearer token');

  const claims = await container.authVerifier.verify(token);
  if (!claims) throw AppError.unauthorized('Invalid or expired token');

  const user = await container.userRepository.findByClerkId(claims.clerkUserId);
  if (!user) throw AppError.unauthorized('User is not provisioned');
  if (!user.isActive()) throw AppError.forbidden('Account is not active');

  req.auth = { userId: user.id, clerkId: user.clerkId, role: user.role };
}

/** Build the auth middleware set bound to the container's verifier + user repo. */
export function createAuthMiddleware(container: Container) {
  const requireAuth = asyncHandler(async (req, _res, next) => {
    await authenticate(container, req);
    next();
  });

  const requireRole = (...roles: UserRole[]) =>
    asyncHandler(async (req, _res, next) => {
      await authenticate(container, req);
      if (!req.auth || !roles.includes(req.auth.role)) {
        throw AppError.forbidden('Insufficient permissions');
      }
      next();
    });

  const optionalAuth = asyncHandler(async (req, _res, next) => {
    try {
      await authenticate(container, req);
    } catch {
      // Anonymous access is allowed; leave req.auth undefined.
    }
    next();
  });

  const requirePlan = (...plans: SubscriptionPlan[]) =>
    asyncHandler(async (req, _res, next) => {
      await authenticate(container, req);
      const subscription = await container.prisma.subscription.findUnique({
        where: { userId: req.auth!.userId },
      });
      const plan = (subscription?.plan ?? 'FREE') as SubscriptionPlan;
      const active = !subscription || ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);
      if (!active || !plans.includes(plan)) {
        throw AppError.forbidden('An active subscription is required for this feature');
      }
      next();
    });

  return { requireAuth, requireRole, optionalAuth, requirePlan };
}

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
