import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import { isUuid } from '../../lib/isUuid';
import { Pool } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Utility function to build dynamic base URL from request headers (works with Replit's *.replit.dev domains)
function getBaseUrl(req: Request) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

// Health check endpoint - GET /api/payout/start
export async function getPayoutStart(req: Request, res: Response) {
  console.log('[PAYOUT START] Health check called');
  const dynamicOrigin = getBaseUrl(req);
  return res.json({ 
    ok: true, 
    origin: dynamicOrigin,
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

    // 🔹 Normalize providerId - convert fabricated IDs to real UUIDs
    if (!isUuid(providerId)) {
      console.log('[PAYOUT START] Non-UUID providerId detected, finding/creating provider...');
      
      try {
        // Find existing provider by user_id
        const findProviderQuery = `
          SELECT id FROM providers WHERE user_id = $1 LIMIT 1
        `;
        const providerResult = await pool.query(findProviderQuery, [userId]);
        
        if (providerResult.rows.length > 0) {
          providerId = providerResult.rows[0].id;
          console.log('[PAYOUT START] Found existing provider:', providerId);
        } else {
          // Create new provider
          const createProviderQuery = `
            INSERT INTO providers (user_id) VALUES ($1) RETURNING id
          `;
          const createResult = await pool.query(createProviderQuery, [userId]);
          providerId = createResult.rows[0].id;
          console.log('[PAYOUT START] Created new provider:', providerId);
        }
      } catch (providerErr: any) {
        console.error('[PAYOUT START] Provider error:', providerErr);
        return res.status(500).json({ 
          success: false, 
          message: `DB error (provider lookup): ${providerErr.message}` 
        });
      }
    }

    // Build dynamic origin URL from request headers
    const ORIGIN = getBaseUrl(req);
    console.log('[PAYOUT START] Using dynamic origin:', ORIGIN);
    console.log('[PAYOUT START] Processing request:', { userId, providerId, applicationId, accountType, origin: ORIGIN });

    // 1) Fetch provider to see if they already have a Connect account (using direct PostgreSQL)
    let provider;
    try {
      const providerQuery = `
        SELECT id, stripe_account_id FROM providers WHERE id = $1 LIMIT 1
      `;
      const providerResult = await pool.query(providerQuery, [providerId]);
      
      if (providerResult.rows.length === 0) {
        console.error('[PAYOUT START] Provider not found for ID:', providerId);
        throw new Error('Provider not found');
      }
      
      provider = providerResult.rows[0];
      console.log('[PAYOUT START] Found provider:', { id: provider.id, hasStripeAccount: !!provider.stripe_account_id });
    } catch (providerErr: any) {
      console.error('[PAYOUT START] Provider fetch error:', providerErr);
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

      // Update provider with new Stripe account ID (using direct PostgreSQL)
      try {
        const updateQuery = `
          UPDATE providers SET stripe_account_id = $1 WHERE id = $2
        `;
        await pool.query(updateQuery, [accountId, providerId]);
        console.log('[PAYOUT START] Updated provider with Stripe account ID');
      } catch (updateErr) {
        console.error('[PAYOUT START] Provider update error:', updateErr);
        throw new Error('Failed to save Stripe account');
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

    // 4) Mark step5 as started (using direct PostgreSQL)
    try {
      const appUpdateQuery = `
        UPDATE provider_applications 
        SET step5_status = $1 
        WHERE id = $2 AND user_id = $3
      `;
      await pool.query(appUpdateQuery, ['started', applicationId, userId]);
      console.log('[PAYOUT START] Updated application step5_status to started');
    } catch (appUpdateErr) {
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