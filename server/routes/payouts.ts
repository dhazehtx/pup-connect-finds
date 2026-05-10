import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../lib/config';
import { getConnectAppFeeBps } from '../lib/platformFees';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Stripe only if we have a secret key
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' });
}

// Compute platform/app fee (in cents) from gross amount (cents)
function computeAppFee(amountCents: number) {
  const fee = Math.floor((amountCents * getConnectAppFeeBps()) / 10_000);
  return fee;
}

// POST /api/payouts/release - Release eligible payouts (cron-friendly)
router.post('/release', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    console.log('[PAYOUTS] Stripe not configured, skipping payout release');
    return res.json({ released: 0, failed: 0, message: 'Stripe not configured' });
  }

  try {
    // 1) Fetch all payouts eligible to release with booking and provider info
    const query = `
      SELECT 
        p.id as payout_id,
        p.booking_id,
        p.status as payout_status,
        p.stripe_transfer_id,
        p.net_to_provider,
        p.app_fee,
        p.eligible_at,
        o.id as booking_id,
        o.amount_total as booking_amount,
        o.status as booking_status,
        o.payment_intent_id,
        o.checkout_session_id,
        pr.id as provider_id,
        pr.stripe_account_id,
        pr.charges_enabled,
        pr.payouts_enabled
      FROM payouts p
      JOIN orders o ON p.booking_id = o.id
      JOIN providers pr ON pr.user_id = o.user_id
      WHERE p.status = 'pending_release'
        AND p.eligible_at <= NOW()
    `;
    
    const result = await pool.query(query);
    const eligiblePayouts = result.rows;

    console.log(`[PAYOUTS] Found ${eligiblePayouts.length} eligible payouts to process`);

    let released = 0;
    let failed = 0;

    for (const row of eligiblePayouts) {
      try {
        // Validate prerequisites
        if (!row.stripe_account_id) {
          throw new Error('Provider missing stripe_account_id');
        }
        if (!row.charges_enabled || !row.payouts_enabled) {
          throw new Error('Provider not enabled for charges/payouts');
        }
        if (row.booking_status !== 'completed') {
          throw new Error('Booking not completed yet');
        }

        const gross = parseInt(row.booking_amount); // cents
        const appFee = computeAppFee(gross);
        const toProvider = gross - appFee;
        
        if (toProvider <= 0) {
          throw new Error('Computed provider amount <= 0');
        }

        console.log(`[PAYOUTS] Creating transfer: $${toProvider/100} to ${row.stripe_account_id} (fee: $${appFee/100})`);

        // 2) Create transfer to connected account
        const transfer = await stripe.transfers.create({
          amount: toProvider,
          currency: 'usd',
          destination: row.stripe_account_id,
          metadata: {
            booking_id: row.booking_id,
            payout_id: row.payout_id,
          },
        });

        // 3) Update payout row
        const updateQuery = `
          UPDATE payouts 
          SET 
            status = 'created',
            stripe_transfer_id = $1,
            net_to_provider = $2,
            app_fee = $3,
            error = NULL,
            released_at = NOW()
          WHERE id = $4
        `;

        await pool.query(updateQuery, [
          transfer.id,
          toProvider,
          appFee,
          row.payout_id
        ]);

        console.log(`[PAYOUTS] Successfully released payout ${row.payout_id}, transfer ${transfer.id}`);
        released++;

      } catch (error: any) {
        console.error(`[PAYOUTS] Failed to release payout ${row.payout_id}:`, error.message);
        
        // Update payout with error message
        const errorQuery = `
          UPDATE payouts 
          SET error = $1 
          WHERE id = $2
        `;
        await pool.query(errorQuery, [error.message, row.payout_id]);
        
        failed++;
      }
    }

    console.log(`[PAYOUTS] Release job completed: ${released} released, ${failed} failed`);

    res.json({ 
      released, 
      failed,
      total: eligiblePayouts.length
    });

  } catch (error) {
    console.error('[PAYOUTS] Error in release job:', error);
    res.status(500).json({ error: 'Failed to process payout releases' });
  }
});

export default router;