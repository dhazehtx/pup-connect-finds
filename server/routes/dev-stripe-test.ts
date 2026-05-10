import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../lib/config";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function isDev(): boolean {
  const env = process.env.NODE_ENV || process.env.APP_ENV || "development";
  return env !== "production";
}

// POST /api/dev/stripe/self-test
router.post("/self-test", async (_req: Request, res: Response) => {
  if (!isDev()) return res.status(403).json({ error: "DEV only" });

  const report: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    proof_logs: [],
    overall: "PENDING",
  };

  function step(name: string, status: "PASS" | "FAIL" | "SKIP", detail?: string) {
    report.steps.push({ name, status, detail });
    debugApiLog(`[PROOF:STRIPE:SELFTEST] ${name}: ${status} ${detail || ""}`);
    report.proof_logs.push(`[PROOF:STRIPE:SELFTEST] ${name}: ${status}`);
  }

  try {
    // Step 1: Check Stripe keys
    if (!STRIPE_SECRET_KEY) {
      step("STRIPE_SECRET_KEY", "FAIL", "Missing STRIPE_SECRET_KEY env var");
      step("STRIPE_WEBHOOK_SECRET", "SKIP", "Skipped due to missing secret key");
      report.overall = "FAIL";
      report.patch = "Set STRIPE_SECRET_KEY in environment secrets";
      return res.json(report);
    }
    step("STRIPE_SECRET_KEY", "PASS", "Key present (starts with " + STRIPE_SECRET_KEY.substring(0, 7) + "...)");

    if (!STRIPE_WEBHOOK_SECRET) {
      step("STRIPE_WEBHOOK_SECRET", "FAIL", "Missing - webhooks won't verify signatures");
    } else {
      step("STRIPE_WEBHOOK_SECRET", "PASS", "Present");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" as any });

    // Step 2: Verify Stripe API connectivity
    try {
      const balance = await stripe.balance.retrieve();
      step("STRIPE_API_CONNECTION", "PASS", `Available balance: ${balance.available?.[0]?.amount || 0} cents`);
    } catch (err: any) {
      step("STRIPE_API_CONNECTION", "FAIL", err.message);
      report.overall = "FAIL";
      report.patch = "Check Stripe API key validity";
      return res.json(report);
    }

    // Step 3: Create test listing + test users in Neon
    let testListingId: string;
    let testBuyerId: string;
    let testSellerId: string;

    try {
      // Check if test profiles exist, create if not
      const { rows: existingBuyer } = await pool.query(
        "SELECT id FROM profiles WHERE email = 'stripe-test-buyer@mypup.dev' LIMIT 1"
      );
      if (existingBuyer[0]) {
        testBuyerId = existingBuyer[0].id;
      } else {
        const { rows } = await pool.query(
          "INSERT INTO profiles (id, username, email, full_name) VALUES (gen_random_uuid(), 'test_buyer', 'stripe-test-buyer@mypup.dev', 'Test Buyer') RETURNING id"
        );
        testBuyerId = rows[0].id;
      }

      const { rows: existingSeller } = await pool.query(
        "SELECT id FROM profiles WHERE email = 'stripe-test-seller@mypup.dev' LIMIT 1"
      );
      if (existingSeller[0]) {
        testSellerId = existingSeller[0].id;
      } else {
        const { rows } = await pool.query(
          "INSERT INTO profiles (id, username, email, full_name) VALUES (gen_random_uuid(), 'test_seller', 'stripe-test-seller@mypup.dev', 'Test Seller') RETURNING id"
        );
        testSellerId = rows[0].id;
      }

      const { rows: listing } = await pool.query(
        `INSERT INTO dog_listings (id, user_id, dog_name, breed, age, price, status, listing_status, description)
         VALUES (gen_random_uuid(), $1, 'Test Dog', 'Test Breed', 2, '500.00', 'active', 'active', 'Self-test listing')
         RETURNING id`,
        [testSellerId]
      );
      testListingId = listing[0].id;

      step("CREATE_TEST_DATA", "PASS", `buyer=${testBuyerId} seller=${testSellerId} listing=${testListingId}`);
    } catch (err: any) {
      step("CREATE_TEST_DATA", "FAIL", err.message);
      report.overall = "FAIL";
      return res.json(report);
    }

    // Step 4: Create deal (DRAFT -> RESERVED)
    let dealId: string;
    try {
      const totalCents = 50000;
      const depositCents = 10000;
      const balanceCents = 40000;
      const platformFeeCents = 5000;
      const reservedUntil = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const { rows } = await pool.query(
        `INSERT INTO deals (listing_id, buyer_id, seller_id, total_price_cents, deposit_cents, balance_cents, 
          platform_fee_cents, status, reserved_until)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'RESERVED', $8) RETURNING id, status`,
        [testListingId, testBuyerId, testSellerId, totalCents, depositCents, balanceCents, platformFeeCents, reservedUntil]
      );
      dealId = rows[0].id;

      if (rows[0].status === "RESERVED") {
        step("DEAL_CREATED_RESERVED", "PASS", `deal=${dealId} status=RESERVED`);
        report.proof_logs.push(`[PROOF:DEAL:STATE] deal=${dealId} DRAFT->RESERVED`);
      } else {
        step("DEAL_CREATED_RESERVED", "FAIL", `Expected RESERVED, got ${rows[0].status}`);
      }
    } catch (err: any) {
      step("DEAL_CREATED_RESERVED", "FAIL", err.message);
      report.overall = "FAIL";
      return res.json(report);
    }

    // Step 5: Create PaymentIntent in test mode
    let paymentIntentId: string;
    try {
      const pi = await stripe.paymentIntents.create({
        amount: 10000,
        currency: "usd",
        metadata: { deal_id: dealId, listing_id: testListingId, kind: "DEPOSIT", user_id: testBuyerId },
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
      paymentIntentId = pi.id;

      await pool.query(
        `INSERT INTO deal_payments (deal_id, kind, stripe_payment_intent_id, amount_cents, status)
         VALUES ($1, 'DEPOSIT', $2, 10000, 'pending')`,
        [dealId, pi.id]
      );

      step("CREATE_PAYMENT_INTENT", "PASS", `pi=${pi.id} status=${pi.status}`);
    } catch (err: any) {
      step("CREATE_PAYMENT_INTENT", "FAIL", err.message);
      report.overall = "FAIL";
      return res.json(report);
    }

    // Step 6: Confirm PaymentIntent with test card
    try {
      const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: "pm_card_visa",
      });

      if (confirmed.status === "succeeded") {
        step("CONFIRM_PAYMENT", "PASS", `pi=${paymentIntentId} status=succeeded`);
      } else {
        step("CONFIRM_PAYMENT", "FAIL", `Expected succeeded, got ${confirmed.status}`);
      }
    } catch (err: any) {
      step("CONFIRM_PAYMENT", "FAIL", err.message);
      report.overall = "FAIL";
      return res.json(report);
    }

    // Step 7: Simulate webhook handling (call same logic inline)
    try {
      await pool.query(
        "UPDATE deal_payments SET status = 'succeeded', updated_at = NOW() WHERE stripe_payment_intent_id = $1",
        [paymentIntentId]
      );
      await pool.query(
        "UPDATE deals SET status = 'DEPOSIT_PAID', updated_at = NOW() WHERE id = $1 AND status = 'RESERVED'",
        [dealId]
      );
      await pool.query(
        "UPDATE dog_listings SET status = 'reserved', listing_status = 'reserved', updated_at = NOW() WHERE id = $1",
        [testListingId]
      );

      debugApiLog(`[PROOF:WEBHOOK:SIMULATED] deal=${dealId} RESERVED->DEPOSIT_PAID`);
      report.proof_logs.push(`[PROOF:DEAL:STATE] deal=${dealId} RESERVED->DEPOSIT_PAID`);

      step("WEBHOOK_SIMULATION", "PASS", "Deal transitioned RESERVED -> DEPOSIT_PAID");
    } catch (err: any) {
      step("WEBHOOK_SIMULATION", "FAIL", err.message);
    }

    // Step 8: Verify final Neon state
    try {
      const { rows: dealState } = await pool.query("SELECT status FROM deals WHERE id = $1", [dealId]);
      const { rows: paymentState } = await pool.query(
        "SELECT status FROM deal_payments WHERE deal_id = $1 AND kind = 'DEPOSIT'",
        [dealId]
      );
      const { rows: listingState } = await pool.query("SELECT status FROM dog_listings WHERE id = $1", [testListingId]);

      const dealOk = dealState[0]?.status === "DEPOSIT_PAID";
      const paymentOk = paymentState[0]?.status === "succeeded";
      const listingOk = listingState[0]?.status === "reserved";

      if (dealOk && paymentOk && listingOk) {
        step("VERIFY_NEON_STATE", "PASS", `deal=${dealState[0].status} payment=${paymentState[0].status} listing=${listingState[0].status}`);
      } else {
        step("VERIFY_NEON_STATE", "FAIL", `deal=${dealState[0]?.status} payment=${paymentState[0]?.status} listing=${listingState[0]?.status}`);
      }
    } catch (err: any) {
      step("VERIFY_NEON_STATE", "FAIL", err.message);
    }

    // Step 9: Cleanup test data
    try {
      await pool.query("DELETE FROM deal_payments WHERE deal_id = $1", [dealId]);
      await pool.query("DELETE FROM deals WHERE id = $1", [dealId]);
      await pool.query("DELETE FROM dog_listings WHERE id = $1", [testListingId]);
      step("CLEANUP", "PASS", "Test data removed");
    } catch (err: any) {
      step("CLEANUP", "FAIL", err.message);
    }

    const failed = report.steps.filter((s: any) => s.status === "FAIL");
    report.overall = failed.length === 0 ? "PASS" : "FAIL";
    if (failed.length > 0) {
      report.patch = `Fix failing steps: ${failed.map((f: any) => f.name).join(", ")}`;
    }

    debugApiLog(`[PROOF:STRIPE:SELFTEST] Overall: ${report.overall}`);
    return res.json(report);
  } catch (error: any) {
    report.overall = "FAIL";
    report.error = error.message;
    return res.status(500).json(report);
  }
});

// POST /api/dev/stripe/webhook-replay
router.post("/webhook-replay", async (req: Request, res: Response) => {
  if (!isDev()) return res.status(403).json({ error: "DEV only" });

  const { event_id } = req.body;
  if (!event_id) return res.status(400).json({ error: "event_id required" });

  try {
    const { rows } = await pool.query(
      "SELECT * FROM stripe_events WHERE event_id = $1",
      [event_id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Event not found in stripe_events" });

    const storedEvent = rows[0];
    const eventPayload = storedEvent.payload;

    // Delete idempotency record so replay can reprocess
    await pool.query("DELETE FROM stripe_idempotency WHERE event_id = $1", [event_id]);

    // Now simulate the webhook processing inline
    const type = eventPayload.type || storedEvent.type;
    const result: any = { event_id, type, reprocessed: false, details: "" };

    if (type === "payment_intent.succeeded") {
      const pi = eventPayload.data?.object;
      const dealId = pi?.metadata?.deal_id;
      const kind = pi?.metadata?.kind;

      if (dealId && kind) {
        await pool.query(
          "UPDATE deal_payments SET status = 'succeeded', updated_at = NOW() WHERE stripe_payment_intent_id = $1",
          [pi.id]
        );

        if (kind === "DEPOSIT") {
          await pool.query(
            "UPDATE deals SET status = 'DEPOSIT_PAID', updated_at = NOW() WHERE id = $1 AND status = 'RESERVED'",
            [dealId]
          );
        } else if (kind === "BALANCE") {
          await pool.query(
            "UPDATE deals SET status = 'PAID_IN_FULL', updated_at = NOW() WHERE id = $1 AND status = 'DEPOSIT_PAID'",
            [dealId]
          );
        }

        // Re-insert idempotency
        await pool.query(
          "INSERT INTO stripe_idempotency (event_id) VALUES ($1) ON CONFLICT DO NOTHING",
          [event_id]
        );

        result.reprocessed = true;
        result.details = `Replayed ${kind} payment for deal ${dealId}`;
        debugApiLog(`[PROOF:WEBHOOK:REPLAYED] event=${event_id} deal=${dealId} kind=${kind}`);
      } else {
        result.details = "Non-deal payment_intent.succeeded — no deal metadata";
      }
    } else {
      result.details = `Event type ${type} replay not implemented — only payment_intent.succeeded supported`;
    }

    return res.json(result);
  } catch (error: any) {
    console.error("[DEV:WEBHOOK_REPLAY] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/dev/stripe/status — quick status check
router.get("/status", async (_req: Request, res: Response) => {
  if (!isDev()) return res.status(403).json({ error: "DEV only" });

  const keys = {
    STRIPE_SECRET_KEY: STRIPE_SECRET_KEY ? `present (${STRIPE_SECRET_KEY.substring(0, 7)}...)` : "MISSING",
    STRIPE_WEBHOOK_SECRET: STRIPE_WEBHOOK_SECRET ? "present" : "MISSING",
    VITE_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY ? "present" : "MISSING",
  };

  const { rows: tables } = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('deals', 'deal_payments', 'deal_payouts', 'deal_disputes', 'stripe_customers', 'stripe_events', 'stripe_idempotency')
    ORDER BY table_name
  `);

  const { rows: dealCounts } = await pool.query(
    "SELECT status, COUNT(*) as count FROM deals GROUP BY status ORDER BY status"
  );

  return res.json({
    environment: process.env.NODE_ENV || "development",
    keys,
    tables: tables.map((t: any) => t.table_name),
    dealCounts,
  });
});

export { router as devStripeTestRouter };