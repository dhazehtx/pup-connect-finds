import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Environment variable fallbacks for proper redirect URLs
const ORIGIN = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPL_SLUG}.replit.app` || 'http://localhost:3000';

// Health check endpoint - GET /api/payout/start
export async function getPayoutStart(req: Request, res: Response) {
  console.log('[PAYOUT START] Health check called');
  return res.json({ 
    ok: true, 
    origin: ORIGIN,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    timestamp: new Date().toISOString()
  });
}

export async function startPayout(req: Request, res: Response) {
  try {
    const body = req.body;
    console.log('[PAYOUT START] Request body:', body);
    
    let { userId, providerId, applicationId, accountType, ein } = body;

    // Simple validation - require all IDs from client
    if (!userId || !providerId || !applicationId) {
      console.error('[PAYOUT START] Missing required fields:', { 
        userId: !!userId, 
        providerId: !!providerId, 
        applicationId: !!applicationId 
      });
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, providerId, applicationId" 
      });
    }
    
    // Basic user validation to prevent abuse
    if (typeof userId !== 'string' || userId.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    console.log('[PAYOUT START] Processing request:', { userId, providerId, applicationId, accountType, origin: ORIGIN });

    // 1) Fetch provider to see if they already have a Connect account
    const { data: provider, error: pErr } = await supabase
      .from('providers')
      .select('id, stripe_account_id')
      .eq('id', providerId)
      .single();

    if (pErr) {
      console.error('[PAYOUT START] Provider fetch error:', pErr);
      throw new Error('Provider not found');
    }

    let accountId = provider?.stripe_account_id;

    // 2) Create Connect account if none exists
    if (!accountId) {
      console.log('[PAYOUT START] Creating new Stripe Connect account');
      
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: { 
          transfers: { requested: true }, 
          card_payments: { requested: true } 
        },
        business_type: accountType === 'business' ? 'company' : 'individual',
        metadata: { 
          providerId, 
          userId, 
          applicationId 
        },
      });
      
      accountId = account.id;
      console.log('[PAYOUT START] Created Stripe account:', accountId);

      // Update provider with new Stripe account ID
      const { error: updateErr } = await supabase
        .from('providers')
        .update({ stripe_account_id: accountId })
        .eq('id', providerId);

      if (updateErr) {
        console.error('[PAYOUT START] Provider update error:', updateErr);
        throw updateErr;
      }
    }

    // 3) Create an Account Link (onboarding URL)
    const link = await stripe.accountLinks.create({
      account: accountId!,
      type: 'account_onboarding',
      return_url: `${ORIGIN}/services/onboarding?step=5&from=stripe`,
      refresh_url: `${ORIGIN}/services/onboarding?step=4&refresh=1`,
    });

    console.log('[PAYOUT START] Created account link:', link.url);

    // Validate that we got a proper URL back from Stripe
    if (!link.url) {
      console.error('[PAYOUT START] No URL returned from Stripe AccountLink');
      throw new Error('Stripe onboarding URL was not returned.');
    }

    // 4) Mark step5 as started
    const { error: appUpdateErr } = await supabase
      .from('provider_applications')
      .update({ 
        step5_status: 'started', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', applicationId)
      .eq('user_id', userId);

    if (appUpdateErr) {
      console.error('[PAYOUT START] Application update error:', appUpdateErr);
      // Don't throw - this is not critical for the user flow
    }

    console.log('[PAYOUT START] Success! Returning URL:', link.url);
    return res.json({ 
      success: true, 
      url: link.url,
      accountId,
      message: 'Payout setup initiated successfully'
    });

  } catch (error: any) {
    console.error('[PAYOUT START] ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Internal server error' 
    });
  }
}