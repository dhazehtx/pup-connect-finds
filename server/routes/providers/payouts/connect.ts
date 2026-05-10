import { Request, Response } from 'express';
import { z } from 'zod';
import { createStripeConnectAccount, createStripeAccountLink } from '../../../lib/stripe/connect';
import { createProviderPayout, getProviderByUserId, getProviderPayout } from '../../../lib/supabase/providers';
import { storage } from '../../../storage';

const connectPayoutSchema = z.object({
  providerId: z.string().uuid(),
  accountType: z.enum(['individual', 'business']),
  returnUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional(),
});

export async function connectStripePayout(req: Request, res: Response) {
  try {
    const { providerId, accountType, returnUrl, refreshUrl } = connectPayoutSchema.parse(req.body);

    // Verify provider exists and belongs to authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const provider = await getProviderByUserId(req.user.id);
    if (!provider || provider.id !== providerId) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Create Stripe Connect account
    const stripeAccount = await createStripeConnectAccount({
      type: 'express',
      country: 'US', // Default to US, could be made configurable
      email: req.user.email ?? undefined,
      business_type: accountType === 'business' ? 'company' : 'individual',
    });

    // Save Stripe account ID to database
    await createProviderPayout({
      provider_id: providerId,
      stripe_account_id: stripeAccount.id,
      account_type: accountType,
    });

    // ALSO update profiles table using Drizzle storage
    const updatedProfile = await storage.updateProfile(req.user.id, {
      stripe_account_id: stripeAccount.id,
      stripe_connected: false, // Will be set to true by webhook when details_submitted
    });

    if (!updatedProfile) {
      console.error('[STRIPE CONNECT] Error updating profiles table for user:', req.user.id);
      throw new Error('Failed to update profile');
    }
    
    console.log('[STRIPE CONNECT] Saved stripe_account_id to profiles table for user:', req.user.id);

    // Create account link for onboarding
    const accountLink = await createStripeAccountLink({
      account: stripeAccount.id,
      refresh_url: refreshUrl || `${process.env.FRONTEND_URL}/provider-onboarding?step=4&refresh=true`,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/provider-onboarding?step=4&connected=true`,
      type: 'account_onboarding',
    });

    res.json({
      accountId: stripeAccount.id,
      accountLinkUrl: accountLink.url,
      status: 'pending_verification',
      message: 'Stripe Connect account created successfully'
    });

  } catch (error) {
    console.error('Stripe Connect error:', error);
    res.status(500).json({ 
      error: 'Failed to create Stripe Connect account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Check Stripe account status
export async function checkStripeAccountStatus(req: Request, res: Response) {
  try {
    const { providerId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const provider = await getProviderByUserId(req.user.id);
    if (!provider || provider.id !== providerId) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Get provider payout info from database
    const payoutInfo = await getProviderPayout(providerId);
    
    if (!payoutInfo?.stripe_account_id) {
      return res.json({ status: 'not_connected' });
    }

    // Check with Stripe API (when real keys are available)
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve(payoutInfo.stripe_account_id);
      
      res.json({
        status: account.charges_enabled ? 'connected' : 'pending_verification',
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });
    } else {
      // Mock response for development
      res.json({
        status: 'connected',
        accountId: payoutInfo.stripe_account_id,
        chargesEnabled: true,
        payoutsEnabled: true,
      });
    }

  } catch (error) {
    console.error('Stripe account status check error:', error);
    res.status(500).json({ error: 'Failed to check account status' });
  }
}

// Note: getProviderPayout is imported from providers service