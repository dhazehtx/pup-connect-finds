import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DOMAIN}` || 'http://localhost:3000';

export async function startPayout(req: Request, res: Response) {
  try {
    const { userId, providerId, applicationId, accountType, ein } = req.body;

    if (!userId || !providerId || !applicationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, providerId, applicationId" 
      });
    }

    console.log('[PAYOUT START] Processing request:', { userId, providerId, applicationId, accountType });

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

    return res.json({ 
      success: true, 
      url: link.url,
      accountId,
      message: 'Payout setup initiated successfully'
    });

  } catch (error: any) {
    console.error('[PAYOUT START] Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Internal server error' 
    });
  }
}