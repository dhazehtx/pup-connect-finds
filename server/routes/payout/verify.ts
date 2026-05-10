import type { Request, Response } from 'express';
import { pool } from '../../db';
import { getStripe } from '../../lib/stripeLazy';

export async function verifyPayout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || req.body?.userId || req.query?.userId;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: { message: 'User not authenticated' },
      });
    }

    // Get provider record with Stripe account ID
    const { rows } = await pool.query<{ stripe_account_id: string | null }>(
      'SELECT stripe_account_id FROM providers WHERE user_id = $1',
      [userId]
    );

    const stripeAccountId = rows[0]?.stripe_account_id;

    if (!stripeAccountId) {
      return res.status(400).json({
        ok: false,
        error: { message: 'No Stripe account found. Please complete Stripe Connect setup first.' },
      });
    }

    // Retrieve account status from Stripe
    const acct = await getStripe().accounts.retrieve(stripeAccountId);

    const connected = !!acct.details_submitted;
    const payoutsEnabled = !!acct.payouts_enabled;
    const chargesEnabled = !!acct.charges_enabled;
    const requirementsDue = acct.requirements?.currently_due ?? [];

    // Update provider record with latest status
    await pool.query(
      `UPDATE providers 
       SET stripe_connected = $1, 
           payouts_enabled = $2, 
           charges_enabled = $3, 
           requirements_due = $4, 
           onboarding_last_checked_at = NOW(),
           updated_at = NOW()
       WHERE user_id = $5`,
      [connected, payoutsEnabled, chargesEnabled, JSON.stringify(requirementsDue), userId]
    );

    return res.json({
      ok: true,
      connected,
      payoutsEnabled,
      chargesEnabled,
      requirementsDue,
      accountId: stripeAccountId,
    });
  } catch (err: any) {
    console.error('[PAYOUT verify] error:', err);
    return res.status(400).json({
      ok: false,
      error: { message: err?.message || 'Verification failed' },
    });
  }
}
