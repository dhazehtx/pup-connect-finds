import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/payout/link
 * Returns a fresh onboarding link for the current logged-in user's connected account
 * Creates Express account and provider row if missing
 */
export async function getPayoutLink(req: Request, res: Response) {
  try {
    // Dev bypass: accept userId from session, body, or query
    const userId = (req as any).user?.id ?? req.body?.userId ?? req.query?.userId;
    if (!userId) {
      return res.status(400).json({ error: "missing_user_id" });
    }
    console.log('[PAYOUT LINK] Using userId:', userId);

    // 1) Load or create provider row
    let provider;
    try {
      const providerQuery = `SELECT id, stripe_account_id FROM providers WHERE user_id = $1 LIMIT 1`;
      const providerResult = await pool.query(providerQuery, [userId]);
      provider = providerResult.rows[0] || null;
    } catch (providerErr: any) {
      console.error("[PAYOUT LINK] provider load error:", providerErr);
      return res.status(500).json({ error: "Failed to load provider." });
    }

    let providerId = provider?.id as string | undefined;
    let stripeAccountId = provider?.stripe_account_id as string | null | undefined;

    // Create provider row if missing
    if (!providerId) {
      try {
        const insertQuery = `INSERT INTO providers (user_id, onboarding_status) VALUES ($1, 'started') RETURNING id, stripe_account_id`;
        const insertResult = await pool.query(insertQuery, [userId]);
        providerId = insertResult.rows[0].id;
        stripeAccountId = insertResult.rows[0].stripe_account_id;
      } catch (insertErr: any) {
        console.error("[PAYOUT LINK] provider insert error:", insertErr);
        return res.status(500).json({ error: "Failed to create provider row." });
      }
    }

    // 2) Create Stripe Express account if missing
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });

      try {
        const updateQuery = `UPDATE providers SET stripe_account_id = $1, onboarding_status = 'started' WHERE id = $2`;
        await pool.query(updateQuery, [account.id, providerId]);
        stripeAccountId = account.id;
      } catch (updateErr: any) {
        console.error("[PAYOUT LINK] provider update error:", updateErr);
        return res.status(500).json({ error: "Failed to save stripe_account_id." });
      }
    }

    // 3) Create fresh onboarding link
    const baseUrl = process.env.BASE_URL || req.protocol + "://" + req.get("host");
    const link = await stripe.accountLinks.create({
      account: stripeAccountId as string,
      refresh_url: `${baseUrl}/payouts/reauth`,
      return_url: `${baseUrl}/payouts/return`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: link.url });
  } catch (err: any) {
    console.error("💥 [PAYOUT LINK] error:", err);
    const message = err?.message ?? "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
