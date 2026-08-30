import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { storage } from '../../storage';
import { STRIPE_SECRET_KEY } from '../../lib/config';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /create-connect-account
 * Creates a Stripe Express account and saves it to profiles table
 */
export async function createConnectAccount(req: Request, res: Response) {
  try {
    // Server-authoritative identity only — never trust a client-supplied userId.
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('[STRIPE CONNECT] Creating account for userId:', userId);

    // Create Stripe Express account
    const account = await stripe.accounts.create({ type: 'express' });

    console.log('[STRIPE CONNECT] Created account:', account.id);

    // Save to profiles table via Drizzle storage
    const updatedProfile = await storage.updateProfile(userId, {
      stripe_account_id: account.id,
      stripe_connected: !!account.details_submitted
    });

    if (!updatedProfile) throw new Error('Failed to update profile');

    // AUTHORITATIVE Connect account location is providers.stripe_account_id — the
    // service payment/payout paths read it (never a client-supplied account).
    // profiles.stripe_account_id is kept in sync above for backwards compatibility.
    await pool.query(
      `UPDATE providers SET stripe_account_id = $1, stripe_connected = $2, updated_at = NOW() WHERE user_id = $3`,
      [account.id, !!account.details_submitted, userId],
    );

    console.log('[STRIPE CONNECT] Saved stripe_account_id (providers authoritative) for user:', userId);

    // Get origin for redirect URLs (prefer local host when running local preview).
    const configuredOrigin = process.env.PUBLIC_APP_URL || process.env.BASE_URL || '';
    const requestHost = req.get('x-forwarded-host') || req.get('host') || '';
    const requestProto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const requestOrigin = requestHost ? `${requestProto}://${requestHost}` : '';
    const isLocalPreview = /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(requestHost);
    const origin = isLocalPreview ? requestOrigin : configuredOrigin || requestOrigin;
    
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
