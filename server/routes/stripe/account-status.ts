import type { Request, Response } from "express";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Supabase service role client for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /stripe/account-status/:acctId/:userId
 * Polls Stripe account status and updates profiles table
 * This is a fallback for when webhooks aren't configured yet
 */
export async function getAccountStatus(req: Request, res: Response) {
  try {
    const { acctId, userId } = req.params;

    if (!acctId || !userId) {
      return res.status(400).json({ error: 'Missing acctId or userId' });
    }

    console.log('[STRIPE ACCOUNT STATUS] Checking account:', acctId, 'for user:', userId);

    // Retrieve account from Stripe
    const acct = await stripe.accounts.retrieve(acctId);
    
    // Check if account is fully ready (both charges and payouts enabled)
    const isReady = !!(acct.charges_enabled && acct.payouts_enabled);

    console.log('[STRIPE ACCOUNT STATUS] Account status:', {
      accountId: acctId,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
      isReady
    });

    // Update profiles table with connection status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        stripe_connected: isReady 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[STRIPE ACCOUNT STATUS] Error updating profiles table:', updateError);
      throw updateError;
    }

    console.log('[STRIPE ACCOUNT STATUS] Updated profiles table for user:', userId);

    res.json({ 
      ready: isReady,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled
    });
  } catch (err: any) {
    console.error('[STRIPE ACCOUNT STATUS] Status check failed:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
    });
    
    res.status(500).json({ 
      error: err?.message || 'Status check failed' 
    });
  }
}
