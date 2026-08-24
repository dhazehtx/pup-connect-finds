import type { Request, Response } from "express";
import Stripe from "stripe";
import { storage } from '../../storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

/**
 * GET /stripe/account-status/:acctId/:userId
 * Polls Stripe account status and updates profiles table
 * This is a fallback for when webhooks aren't configured yet
 */
export async function getAccountStatus(req: Request, res: Response) {
  try {
    const { acctId } = req.params;
    // Server-authoritative identity only — ignore the :userId path param.
    const userId = (req as any).user?.id;

    if (!acctId) {
      return res.status(400).json({ error: 'Missing acctId' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Ensure the account being polled actually belongs to this user before
    // writing connection status onto their profile.
    const profile = await storage.getProfile(userId);
    if (profile?.stripe_account_id && profile.stripe_account_id !== acctId) {
      return res.status(403).json({ error: 'Forbidden' });
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

    // Update profiles table with connection status via Drizzle storage
    const updatedProfile = await storage.updateProfile(userId, { 
      stripe_connected: isReady 
    });

    if (!updatedProfile) {
      console.error('[STRIPE ACCOUNT STATUS] Error updating profiles table for user:', userId);
      throw new Error('Failed to update profile');
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
