import type { Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/payout/dashboard-link
 * Returns Stripe Express dashboard login link for the current logged-in user
 */
export async function getDashboardLink(req: Request, res: Response) {
  try {
    // Check authentication
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user!.id;

    // 1) Load provider row
    let provider;
    try {
      const providerQuery = `SELECT id, stripe_account_id FROM providers WHERE user_id = $1 LIMIT 1`;
      const providerResult = await pool.query(providerQuery, [userId]);
      provider = providerResult.rows[0] || null;
    } catch (providerErr: any) {
      console.error("[DASHBOARD LINK] provider load error:", providerErr);
      return res.status(500).json({ error: "Failed to load provider." });
    }

    // Check if provider has Stripe account
    if (!provider || !provider.stripe_account_id) {
      return res.status(400).json({ 
        error: "No Stripe account found. Please complete onboarding first." 
      });
    }

    // 2) Create login link
    const loginLink = await stripe.accounts.createLoginLink(provider.stripe_account_id);

    return res.status(200).json({ url: loginLink.url });
  } catch (err: any) {
    console.error("💥 [DASHBOARD LINK] error:", err);
    const message = err?.message ?? "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
