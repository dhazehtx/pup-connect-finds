import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2025-08-27.basil" 
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Returns the Stripe Connect account capability flags for the current provider.
 * This uses the DB (userId -> providerId -> stripeAccountId) and the server's Stripe secret.
 */
export async function getStripeAccountStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // 1) Load provider row by user_id
    const providerQuery = `
      SELECT id, stripe_account_id, payout_setup_complete 
      FROM providers 
      WHERE user_id = $1 
      LIMIT 1
    `;
    const providerResult = await pool.query(providerQuery, [userId]);
    
    if (providerResult.rows.length === 0) {
      return res.json({ 
        connected: false, 
        details_submitted: false, 
        charges_enabled: false, 
        payouts_enabled: false,
        message: "No provider found for user"
      });
    }

    const provider = providerResult.rows[0];
    
    if (!provider.stripe_account_id) {
      return res.json({ 
        connected: false, 
        details_submitted: false, 
        charges_enabled: false, 
        payouts_enabled: false,
        message: "No Stripe account connected"
      });
    }

    // 2) Ask Stripe directly for account status
    const account = await stripe.accounts.retrieve(provider.stripe_account_id);

    // 3) Determine if fully connected
    const connected = Boolean(account.charges_enabled && account.payouts_enabled);
    
    // 4) Persist a definitive flag once we're enabled
    if (connected && !provider.payout_setup_complete) {
      const updateQuery = `
        UPDATE providers 
        SET payout_setup_complete = true 
        WHERE id = $1
      `;
      await pool.query(updateQuery, [provider.id]);
    }

    return res.json({
      connected,
      details_submitted: Boolean(account.details_submitted),
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
      requirements: account.requirements, // useful for debugging
      account_id: provider.stripe_account_id
    });

  } catch (err) {
    console.error("stripe account status error", err);
    return res.status(500).json({ error: "status_check_failed" });
  }
}