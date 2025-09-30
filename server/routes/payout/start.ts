import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET: health check for this route
export async function getPayoutStart(req: Request, res: Response) {
  return res.status(200).json({ ok: true, route: "/api/payout/start" });
}

/**
 * POST /api/payout/start
 * Body: { userId: string }
 * Behavior:
 *  - Ensure we have a provider row for this user (service_providers table)
 *  - If provider has no stripe_account_id, create an Express account
 *  - Create an onboarding Account Link and return { url }
 */
export async function startPayout(req: Request, res: Response) {
  console.log("🎯 [PAYOUT] startPayout CALLED!");
  try {
    const { userId } = req.body ?? {};
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'userId'." });
    }

    // 1) Load provider row for this user  
    let provider;
    try {
      const providerQuery = `SELECT id, stripe_account_id FROM providers WHERE user_id = $1 LIMIT 1`;
      const providerResult = await pool.query(providerQuery, [userId]);
      provider = providerResult.rows[0] || null;
    } catch (providerErr: any) {
      console.error("[PAYOUT] provider load error:", providerErr);
      return res.status(500).json({ error: "Failed to load provider." });
    }

    // 2) Ensure provider row exists (create on the fly if needed)
    let providerId = provider?.id as string | undefined;
    let stripeAccountId = provider?.stripe_account_id as string | null | undefined;

    if (!providerId) {
      try {
        const insertQuery = `INSERT INTO providers (user_id) VALUES ($1) RETURNING id, stripe_account_id`;
        const insertResult = await pool.query(insertQuery, [userId]);
        providerId = insertResult.rows[0].id;
        stripeAccountId = insertResult.rows[0].stripe_account_id;
      } catch (insertErr: any) {
        console.error("[PAYOUT] provider insert error:", insertErr);
        return res.status(500).json({ error: "Failed to create provider row." });
      }
    }

    // 3) Create Stripe Express account if missing
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({ type: "express" });

      try {
        const updateQuery = `UPDATE providers SET stripe_account_id = $1 WHERE id = $2`;
        await pool.query(updateQuery, [account.id, providerId]);
        stripeAccountId = account.id;
      } catch (updateErr: any) {
        console.error("[PAYOUT] provider update error:", updateErr);
        return res.status(500).json({ error: "Failed to save stripe_account_id." });
      }
    }

    // 4) Create onboarding link
    const refresh_url = `${process.env.BASE_URL ?? "https://pup-connect-finds.danieluke97.repl.co"}/payouts/reauth`;
    const return_url = `${process.env.BASE_URL ?? "https://pup-connect-finds.danieluke97.repl.co"}/payouts/return`;

    const link = await stripe.accountLinks.create({
      account: stripeAccountId as string,
      refresh_url,
      return_url,
      type: "account_onboarding",
    });

    // 5) Respond with JSON (this is what Postman should see)
    return res.status(200).json({ url: link.url });
  } catch (err: any) {
    console.error("💥 [PAYOUT] startPayout error:", err);
    const message = err?.message ?? "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
