import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function checkPayoutStatus(req: Request, res: Response) {
  try {
    const { userId, providerId, applicationId } = req.body;

    if (!userId || !providerId || !applicationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, providerId, applicationId" 
      });
    }

    console.log('[PAYOUT STATUS] Checking status:', { userId, providerId, applicationId });

    // 1) Find the provider's stripe account id
    const { data: provider, error: pErr } = await supabase
      .from('providers')
      .select('stripe_account_id')
      .eq('id', providerId)
      .single();

    if (pErr || !provider?.stripe_account_id) {
      console.error('[PAYOUT STATUS] Provider or account not found:', pErr);
      return res.status(400).json({ 
        success: false, 
        message: 'Provider Stripe account not found' 
      });
    }

    // 2) Retrieve account status from Stripe
    const account = await stripe.accounts.retrieve(provider.stripe_account_id);
    
    console.log('[PAYOUT STATUS] Stripe account status:', {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due?.length || 0
    });

    // 3) Determine if account is fully connected
    const connected = account.details_submitted && 
                     account.charges_enabled && 
                     (account.requirements?.currently_due?.length || 0) === 0;

    // 4) Mark step complete if connected
    if (connected) {
      console.log('[PAYOUT STATUS] Marking step 5 as completed');
      
      const { error: updateErr } = await supabase
        .from('provider_applications')
        .update({ 
          step5_status: 'completed', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', applicationId)
        .eq('user_id', userId);

      if (updateErr) {
        console.error('[PAYOUT STATUS] Application update error:', updateErr);
        // Don't throw - return status anyway
      }
    }

    return res.json({ 
      success: true, 
      connected,
      account: {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements_pending: account.requirements?.currently_due?.length || 0
      },
      message: connected ? 'Payout setup completed successfully' : 'Payout setup still pending'
    });

  } catch (error: any) {
    console.error('[PAYOUT STATUS] Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Internal server error' 
    });
  }
}