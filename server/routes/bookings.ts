import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import { PAYOUT_HOLD_DAYS } from '../lib/config';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/bookings/complete - Mark booking completed and set payout eligibility
router.post('/complete', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { bookingId } = req.body as { bookingId: string };
  
  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId required' });
  }

  try {
    // 1) Mark booking completed
    const updateBookingQuery = `
      UPDATE orders 
      SET status = 'completed', updated_at = NOW()
      WHERE id = $1
      RETURNING id, service_date
    `;
    
    const bookingResult = await pool.query(updateBookingQuery, [bookingId]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

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