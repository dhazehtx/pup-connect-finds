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
    // Check authentication
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user!.id;

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

    // Determine onboarding status
    let onboardingStatus = 'pending';
    if (chargesEnabled && payoutsEnabled && requirementsDue.length === 0) {
      onboardingStatus = 'completed';
    } else if (requirementsDue.length > 0) {
      onboardingStatus = 'needs_requirements';
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
