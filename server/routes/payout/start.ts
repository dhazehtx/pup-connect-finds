import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { storage } from '../../storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET: health check for this route
export async function getPayoutStart(req: Request, res: Response) {
  return res.status(200).json({ ok: true, route: "/api/payout/start" });
}

/**
 * POST /api/payout/start
 * Creates a Stripe Express account and returns an onboarding link
 */
export async function startPayout(req: Request, res: Response) {
  try {
    // --- Auth first (fail-fast). Server-authoritative identity only.
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: { message: "Authentication required." },
      });
    }

    // --- Basic sanity checks
    const configuredOrigin = process.env.PUBLIC_APP_URL || process.env.BASE_URL || "";
    const requestHost = req.get("x-forwarded-host") || req.get("host") || "";
    const requestProto = req.get("x-forwarded-proto") || req.protocol || "http";
    const requestOrigin = requestHost ? `${requestProto}://${requestHost}` : "";
    const isLocalPreview = /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(requestHost);
    const origin = isLocalPreview ? requestOrigin : configuredOrigin || requestOrigin;

    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
      console.warn("[PAYOUT] Warning: not using a test key");
    }
    
    if (!origin || !/^https?:\/\//i.test(origin)) {
      throw new Error(
        "Missing or invalid PUBLIC_APP_URL/BASE_URL. Set a public https URL for return/refresh."
      );
    }

    console.log("[PAYOUT] Starting payout for userId:", userId);

    // --- Load or create connected account
    let stripeAccountId = await getStripeAccountIdForUser(userId);
    
    if (!stripeAccountId) {
      console.log("[PAYOUT] No existing account, creating new Express account");
      const acct = await stripe.accounts.create({
        type: "express",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });
      stripeAccountId = acct.id;
      await saveStripeAccountId(userId, stripeAccountId);
      console.log("[PAYOUT] Created account:", stripeAccountId);
    } else {
      console.log("[PAYOUT] Using existing account:", stripeAccountId);
    }

    // --- Create account link. An optional returnTo (in-app path only — never a
    // full URL, so this cannot open-redirect) lets non-provider surfaces like a
    // Protected Payment deal bring the seller back where they started; PAWS
    // re-reads authoritative Connect status from Stripe on return.
    const rawReturnTo = (req.body as any)?.returnTo;
    const returnTo =
      typeof rawReturnTo === "string" &&
      rawReturnTo.startsWith("/") &&
      !rawReturnTo.startsWith("//") &&
      /^[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*$/.test(rawReturnTo)
        ? rawReturnTo
        : null;
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: "account_onboarding",
      refresh_url: returnTo ? `${origin}${returnTo}` : `${origin}/services/onboarding/stripe/refresh`,
      return_url: returnTo ? `${origin}${returnTo}` : `${origin}/services/onboarding/stripe/return`,
    });

    console.log("[PAYOUT] Created onboarding link successfully");
    return res.json({ ok: true, url: link.url });
  } catch (err: any) {
    // Print everything we can to the server logs
    console.error("[PAYOUT] Failed to create onboarding link:", {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      param: err?.param,
      raw: err?.raw?.message,
    });
    
    // Return a helpful message to the client
    return res.status(500).json({
      ok: false,
      error: {
        message:
          err?.raw?.message ||
          err?.message ||
          "Stripe onboarding failed. Check server logs for details.",
      },
    });
  }
}

// --- Database helper functions

async function getStripeAccountIdForUser(userId: string): Promise<string | null> {
  try {
    // 1) Load provider row for this user
    const providerQuery = `SELECT id, stripe_account_id FROM providers WHERE user_id = $1 LIMIT 1`;
    const providerResult = await pool.query(providerQuery, [userId]);
    const provider = providerResult.rows[0] || null;

    let providerId = provider?.id as string | undefined;
    let stripeAccountId = provider?.stripe_account_id as string | null | undefined;

    // 2) Ensure provider row exists (create on the fly if needed)
    if (!providerId) {
      const insertQuery = `INSERT INTO providers (user_id) VALUES ($1) RETURNING id, stripe_account_id`;
      const insertResult = await pool.query(insertQuery, [userId]);
      providerId = insertResult.rows[0].id;
      stripeAccountId = insertResult.rows[0].stripe_account_id;
    }

    return stripeAccountId || null;
  } catch (error: any) {
    console.error("[PAYOUT] Error in getStripeAccountIdForUser:", error);
    throw error;
  }
}

async function saveStripeAccountId(userId: string, acctId: string): Promise<void> {
  try {
    // 1) Update providers table (for backwards compatibility)
    const providerQuery = `SELECT id FROM providers WHERE user_id = $1 LIMIT 1`;
    const providerResult = await pool.query(providerQuery, [userId]);
    const providerId = providerResult.rows[0]?.id;

    if (!providerId) {
      throw new Error(`No provider found for userId: ${userId}`);
    }

    const updateQuery = `UPDATE providers SET stripe_account_id = $1 WHERE id = $2`;
    await pool.query(updateQuery, [acctId, providerId]);
    
    console.log("[PAYOUT] Saved stripe_account_id to providers table:", providerId);

    // 2) ALSO update profiles table via Drizzle storage
    const updatedProfile = await storage.updateProfile(userId, {
      stripe_account_id: acctId,
      stripe_connected: false, // Will be set to true by webhook when details_submitted
    });

    if (!updatedProfile) {
      console.error("[PAYOUT] Error updating profiles table for user:", userId);
      throw new Error('Failed to update profile');
    }
    
    console.log("[PAYOUT] Saved stripe_account_id to profiles table for user:", userId);
  } catch (error: any) {
    console.error("[PAYOUT] Error in saveStripeAccountId:", error);
    throw error;
  }
}
