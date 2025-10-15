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
 * POST /create-connect-account
 * Creates a Stripe Express account and saves it to profiles table
 */
export async function createConnectAccount(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    console.log('[STRIPE CONNECT] Creating account for userId:', userId);

    // Create Stripe Express account
    const account = await stripe.accounts.create({ type: 'express' });

    console.log('[STRIPE CONNECT] Created account:', account.id);

    // Save to profiles table using Supabase service role
    const { error: upsertError } = await supabase
      .from('profiles')
      .update({
        stripe_account_id: account.id,
        stripe_connected: !!account.details_submitted
      })
      .eq('id', userId);

    if (upsertError) throw upsertError;

    console.log('[STRIPE CONNECT] Saved stripe_account_id to profiles table for user:', userId);

    // Get origin for redirect URLs
    const origin = process.env.PUBLIC_APP_URL || process.env.BASE_URL || '';
    
    if (!origin || !/^https?:\/\//i.test(origin)) {
      throw new Error('Missing or invalid PUBLIC_APP_URL/BASE_URL');
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/services/onboarding/stripe/refresh`,
      return_url: `${origin}/services/onboarding/stripe/return`,
      type: 'account_onboarding'
    });

    console.log('[STRIPE CONNECT] Created onboarding link successfully');

    res.json({ 
      accountId: account.id, 
      onboardingUrl: link.url,
      url: link.url // For compatibility with existing client code
    });
  } catch (err: any) {
    console.error('[STRIPE CONNECT] Failed to create connect account:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      raw: err?.raw?.message,
    });
    
    res.status(500).json({ 
      error: err?.raw?.message || err?.message || 'Failed to create connect account' 
    });
  }
}
