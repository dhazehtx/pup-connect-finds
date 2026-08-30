import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import { PAYOUT_HOLD_DAYS } from '../lib/config';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/bookings/complete — LEGACY orders-based completion. Superseded by the
// authoritative POST /api/service-bookings/:id/complete. It flips order state and
// starts a payout clock, so it is now ADMIN-ONLY (previously unauthenticated: any
// caller could complete any order and trigger payout eligibility). Idempotent.
router.post('/complete', requireAuth, requireAdmin, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { bookingId } = req.body as { bookingId: string };

  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId required' });
  }

  try {
    // 1) Mark booking completed (idempotent: only transitions a non-completed order)
    const existing = await pool.query('SELECT id, status FROM orders WHERE id = $1 LIMIT 1', [bookingId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (existing.rows[0].status === 'completed') {
      return res.json({ ok: true, bookingId, alreadyCompleted: true });
    }
    await pool.query(
      `UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1 AND status <> 'completed'`,
      [bookingId],
    );

    // 2) Set eligible_at on payouts row using atomic function
    const holdSeconds = PAYOUT_HOLD_DAYS * 24 * 60 * 60;
    
    await pool.query('SELECT public.set_payout_eligible_at($1, $2)', [bookingId, holdSeconds]);

    // Get the updated payout info to return to client
    const payoutQuery = `
      SELECT eligible_at, status
      FROM payouts 
      WHERE booking_id = $1 AND status = 'pending_release'
      LIMIT 1
    `;
    const payoutResult = await pool.query(payoutQuery, [bookingId]);
    const payout = payoutResult.rows[0];

    console.log(`[BOOKINGS] Booking ${bookingId} marked as completed, payout eligible at ${payout?.eligible_at || 'N/A'}`);

    res.json({ 
      ok: true, 
      bookingId,
      eligibleAt: payout?.eligible_at,
      payoutsUpdated: payoutResult.rowCount
    });

  } catch (error) {
    console.error('[BOOKINGS] Error completing booking:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

export default router;