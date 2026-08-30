/**
 * Service-provider booking payments (mounted at /api/service-bookings).
 *
 * Authoritative, server-controlled path for the money flow described in
 * server/lib/serviceBookingPayments.ts. Every money-changing route requires
 * authentication and verifies the caller's relationship to the booking. Amounts,
 * commission and the payout destination are ALL derived server-side from the
 * booking/service/provider relationship — never from the request body.
 */
import { Router, type Request, type Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getStripe } from '../lib/stripeLazy';
import { getConnectAppFeeBps } from '../lib/platformFees';
import {
  resolveBookingProvider,
  computeServiceFee,
  serviceBookingPool as pool,
} from '../lib/serviceBookingPayments';

const router = Router();

/**
 * POST /api/service-bookings/:id/pay — the booking's customer pays.
 * Server-authoritative amount + commission; PaymentIntent held on the platform
 * account (separate charges + transfers). No client amount/destination.
 */
router.post('/:id/pay', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const bookingId = req.params.id;

    const b = await resolveBookingProvider(bookingId);
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    // Only the booking's customer may pay for it.
    if (b.customerUserId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (b.paymentStatus === 'paid') {
      return res.status(409).json({ error: 'Booking already paid' });
    }
    const amountCents = b.totalPriceCents;
    if (amountCents <= 0) {
      return res.status(400).json({ error: 'Booking has no valid price' });
    }

    const feeBps = getConnectAppFeeBps();
    const { platformFeeCents, providerAmountCents } = computeServiceFee(amountCents, feeBps);

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        // No transfer_data: funds are held on the platform until completion.
        metadata: {
          kind: 'service_booking',
          booking_id: bookingId,
          customer_user_id: b.customerUserId,
          provider_user_id: b.providerUserId || '',
          platform_fee_cents: String(platformFeeCents),
          provider_amount_cents: String(providerAmountCents),
        },
      },
      { idempotencyKey: `svcpay_${bookingId}` }, // retries never create a second charge
    );

    await pool.query(
      `UPDATE service_bookings SET
         amount_cents = $2,
         currency = 'usd',
         platform_fee_cents = $3,
         provider_amount_cents = $4,
         stripe_payment_intent_id = $5,
         payment_status = 'processing',
         updated_at = NOW()
       WHERE id = $1`,
      [bookingId, amountCents, platformFeeCents, providerAmountCents, pi.id],
    );

    res.json({ clientSecret: pi.client_secret, paymentIntentId: pi.id, amountCents });
  } catch (err) {
    console.error('[SERVICE PAY] error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to start booking payment' });
  }
});

/**
 * POST /api/service-bookings/:id/complete — mark the service completed so payout
 * becomes eligible. Allowed for the booking's customer, the provider owner, or an
 * admin. Idempotent; only ever mutates this service booking (never Store orders).
 */
router.post('/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const isAdmin = Boolean((req as any).user?.is_admin);
    const bookingId = req.params.id;

    const b = await resolveBookingProvider(bookingId);
    if (!b) return res.status(404).json({ error: 'Booking not found' });

    const isCustomer = b.customerUserId === userId;
    const isProvider = b.providerUserId != null && b.providerUserId === userId;
    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (b.status === 'completed') {
      // Idempotent: already completed.
      return res.json({ status: 'completed', payoutStatus: b.payoutStatus });
    }
    if (b.paymentStatus !== 'paid') {
      return res.status(409).json({ error: 'Booking is not paid; cannot complete' });
    }

    const completedBy = isAdmin ? 'admin' : isCustomer ? 'customer' : 'provider';
    await pool.query(
      `UPDATE service_bookings SET
         status = 'completed',
         completed_by = $2,
         completed_at = NOW(),
         payout_status = 'pending_release',
         updated_at = NOW()
       WHERE id = $1 AND status <> 'completed'`,
      [bookingId, completedBy],
    );
    res.json({ status: 'completed', payoutStatus: 'pending_release' });
  } catch (err) {
    console.error('[SERVICE COMPLETE] error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

/**
 * POST /api/service-bookings/:id/release — transfer the provider's proceeds to
 * the booking's authoritative provider Connect account. Admin/cron only. The
 * recipient is derived from the booking/service/provider relationship (never the
 * buyer, never a client-supplied account). Idempotent (DB guard + Stripe key).
 */
router.post('/:id/release', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const b = await resolveBookingProvider(bookingId);
    if (!b) return res.status(404).json({ error: 'Booking not found' });

    if (b.payoutStatus === 'released') {
      return res.status(409).json({ error: 'Payout already released' });
    }
    if (b.paymentStatus !== 'paid') {
      return res.status(409).json({ error: 'Booking is not paid' });
    }
    if (b.status !== 'completed') {
      return res.status(409).json({ error: 'Booking is not completed' });
    }
    // Recipient integrity: must have an authoritative provider Connect account.
    if (!b.providerUserId || !b.connectAccountId) {
      return res.status(409).json({ error: 'Provider has no connected payout account' });
    }
    if (!b.chargesEnabled || !b.payoutsEnabled) {
      return res.status(409).json({ error: 'Provider account not enabled for payouts' });
    }

    // Server-computed provider proceeds (recompute from the booking, don't trust input).
    const amountCents = b.totalPriceCents;
    const { providerAmountCents } = computeServiceFee(amountCents, getConnectAppFeeBps());
    if (providerAmountCents <= 0) {
      return res.status(409).json({ error: 'Nothing to transfer' });
    }

    const stripe = getStripe();
    let transferId: string;
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: providerAmountCents,
          currency: 'usd',
          destination: b.connectAccountId, // authoritative provider account
          transfer_group: `booking_${bookingId}`,
          metadata: { booking_id: bookingId, provider_user_id: b.providerUserId },
        },
        { idempotencyKey: `release_${bookingId}` }, // retries never create a second transfer
      );
      transferId = transfer.id;
    } catch (transferErr) {
      // Payout FAILED — never mark the booking released.
      console.error('[SERVICE RELEASE] transfer failed:', (transferErr as Error)?.message);
      await pool.query(
        `UPDATE service_bookings SET payout_status = 'failed', updated_at = NOW()
         WHERE id = $1 AND payout_status <> 'released'`,
        [bookingId],
      );
      return res.status(502).json({ error: 'Transfer failed' });
    }

    await pool.query(
      `UPDATE service_bookings SET
         payout_status = 'released',
         stripe_transfer_id = $2,
         released_at = NOW(),
         updated_at = NOW()
       WHERE id = $1 AND payout_status <> 'released'`,
      [bookingId, transferId],
    );
    res.json({ payoutStatus: 'released', transferId, providerAmountCents });
  } catch (err) {
    console.error('[SERVICE RELEASE] error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to release payout' });
  }
});

export default router;
