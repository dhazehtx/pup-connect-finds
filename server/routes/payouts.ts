import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * The payout-release job moves real money to connected accounts, so it must never
 * be publicly triggerable. Allow either an authenticated admin session or a
 * matching CRON_SECRET bearer/header (for scheduled invocation). Fails closed.
 */
function requireAdminOrCron(req: Request, res: Response, next: NextFunction) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const headerSecret = (req.get('x-cron-secret') || '').trim();
    const authHeader = req.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (headerSecret === cronSecret || bearer === cronSecret) {
      return next();
    }
  }
  if ((req as any).user?.is_admin) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden', code: 'ADMIN_OR_CRON_REQUIRED' });
}

// POST /api/payouts/release — NEUTRALIZED legacy orders-based payout release.
//
// This job previously resolved the payout recipient by joining the providers
// table to orders on the BUYER's user id (orders has no provider reference), so
// it could transfer a provider's proceeds to the buyer's connected account (or
// nobody). The recipient can never be authoritatively derived from an order.
//
// Service payouts now run through the authoritative
// POST /api/service-bookings/:id/release, which derives the provider from the
// booking → pet_service_providers.user_id → providers.stripe_account_id
// relationship and transfers only to that provider's Connect account. This
// endpoint is retained (admin/cron-gated, fail-closed) but performs NO transfers.
router.post('/release', requireAdminOrCron, async (_req: Request, res: Response) => {
  return res.json({
    released: 0,
    failed: 0,
    total: 0,
    message:
      'Legacy orders-based payout release is superseded by POST /api/service-bookings/:id/release and performs no transfers.',
  });
});

export default router;
