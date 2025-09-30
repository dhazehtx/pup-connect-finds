import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/payout/status
 * Returns account status for the current logged-in user's connected account
 * Returns create_account flag if no account exists
 */
export async function getPayoutStatus(req: Request, res: Response) {
  try {
    // Dev bypass: accept userId from session, body, or query
    const userId = (req as any).user?.id ?? req.body?.userId ?? req.query?.userId;
    if (!userId) {
      return res.status(400).json({ error: "missing_user_id" });
    }
    console.log('[PAYOUT STATUS] Using userId:', userId);

    // 1) Load provider row
    let provider;
    try {
      const providerQuery = `SELECT id, stripe_account_id, onboarding_status FROM providers WHERE user_id = $1 LIMIT 1`;
      const providerResult = await pool.query(providerQuery, [userId]);
      provider = providerResult.rows[0] || null;
    } catch (providerErr: any) {
      console.error("[PAYOUT STATUS] provider load error:", providerErr);
      return res.status(500).json({ error: "Failed to load provider." });
    }

    // If no provider or no Stripe account, indicate account needs to be created
    if (!provider || !provider.stripe_account_id) {
      return res.status(200).json({
        charges_enabled: false,
        payouts_enabled: false,
        requirements_due: [],
        create_account: true,
      });
    }

    // 2) Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(provider.stripe_account_id);

    // Extract requirements
    const requirementsDue = account.requirements?.currently_due || [];
    const chargesEnabled = account.charges_enabled || false;
    const payoutsEnabled = account.payouts_enabled || false;

    // Determine onboarding status (using allowed values: 'started', 'requires_action', 'verified')
    let onboardingStatus = 'started';
    if (chargesEnabled && payoutsEnabled && requirementsDue.length === 0) {
      onboardingStatus = 'verified';
    } else if (requirementsDue.length > 0) {
      onboardingStatus = 'requires_action';
    }

    // 3) Update provider record with latest status
    try {
      const updateQuery = `
        UPDATE providers 
        SET 
          charges_enabled = $1,
          payouts_enabled = $2,
          requirements_due = $3,
          onboarding_status = $4,
          onboarding_last_checked_at = NOW()
        WHERE id = $5
      `;
      await pool.query(updateQuery, [
        chargesEnabled,
        payoutsEnabled,
        JSON.stringify(requirementsDue),
        onboardingStatus,
        provider.id,
      ]);
    } catch (updateErr: any) {
      console.error("[PAYOUT STATUS] update error:", updateErr);
      // Don't fail the request if update fails
    }

    return res.status(200).json({
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      requirements_due: requirementsDue,
    });
  } catch (err: any) {
    console.error("💥 [PAYOUT STATUS] error:", err);
    const message = err?.message ?? "Unexpected error";
    return res.status(500).json({ error: message });
  }
}

/**
 * Legacy POST /api/payout/status for backward compatibility
 * Kept for existing integrations
 */
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

    // Find the provider's stripe account id
    let provider;
    try {
      const providerQuery = `SELECT id, stripe_account_id FROM providers WHERE id = $1 LIMIT 1`;
      const providerResult = await pool.query(providerQuery, [providerId]);
      provider = providerResult.rows[0] || null;
    } catch (providerErr: any) {
      console.error('[PAYOUT STATUS] Provider load error:', providerErr);
      return res.status(400).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    if (!provider?.stripe_account_id) {
      console.error('[PAYOUT STATUS] Stripe account not found');
      return res.status(400).json({ 
        success: false, 
        message: 'Provider Stripe account not found' 
      });
    }

    // Retrieve account status from Stripe
    const account = await stripe.accounts.retrieve(provider.stripe_account_id);
    
    console.log('[PAYOUT STATUS] Stripe account status:', {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due?.length || 0
    });

    // Determine if account is fully connected
    const connected = account.details_submitted && 
                     account.charges_enabled && 
                     (account.requirements?.currently_due?.length || 0) === 0;

    // Mark step complete if connected (using PostgreSQL instead of Supabase)
    if (connected && applicationId) {
      console.log('[PAYOUT STATUS] Marking step 5 as completed');
      
      try {
        const updateQuery = `
          UPDATE provider_applications 
          SET step5_status = 'completed', updated_at = NOW() 
          WHERE id = $1 AND user_id = $2
        `;
        await pool.query(updateQuery, [applicationId, userId]);
      } catch (updateErr) {
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
