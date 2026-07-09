import { UserRole } from '@mnemonic/core';
import { Router } from 'express';
import type { Container } from '../../../container/container.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { AuthMiddleware } from '../../auth/auth.middleware.js';
import { AdminController } from './admin.controller.js';

/** `/admin` router — ADMIN-only overview, moderation, and word generation. */
export function createAdminRouter(container: Container, auth: AuthMiddleware): Router {
  const a = container.admin;
  const controller = new AdminController(
    a.overview,
    a.listMnemonics,
    a.moderateMnemonic,
    a.listReports,
    a.resolveReport,
    a.generateWord,
  );
  const router = Router();
  const admin = auth.requireRole(UserRole.ADMIN);

  router.get('/overview', admin, asyncHandler(controller.overview));
  router.get('/moderation/mnemonics', admin, asyncHandler(controller.mnemonics));
  router.post('/moderation/mnemonics/:id', admin, asyncHandler(controller.moderate));
  router.get('/moderation/reports', admin, asyncHandler(controller.reports));
  router.post('/moderation/reports/:id', admin, asyncHandler(controller.resolve));
  router.post('/words', admin, asyncHandler(controller.generateWord));

  return router;
}
