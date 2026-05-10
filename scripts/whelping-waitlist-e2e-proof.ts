import "dotenv/config";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";

type StepStatus = "PASS" | "FAIL" | "SKIP";

function logStep(report: any, name: string, status: StepStatus, detail?: string) {
  report.steps.push({ name, status, detail });
  const line = `[PROOF:WHELPING_WAITLIST_E2E] ${name}: ${status}${detail ? ` ${detail}` : ""}`;
  report.proof_logs.push(line);
  console.log(line);
}

async function main() {
  const report: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    proof_logs: [],
    overall: "PENDING",
  };

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  const base = (process.env.MESSAGING_VERIFY_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

  if (!stripeSecret || !webhookSecret || !dbUrl) {
    logStep(
      report,
      "ENV_CHECK",
      "FAIL",
      `missing stripeSecret=${!stripeSecret} webhookSecret=${!webhookSecret} dbUrl=${!dbUrl}`,
    );
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  logStep(report, "ENV_CHECK", "PASS", `base=${base}`);

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" as any });
  const pool = new Pool({ connectionString: dbUrl });

  let providerId = "";
  let providerUserId = "";
  let buyerUserId = "";
  let waitlistId = "";

  try {
    const now = Date.now();
    const { rows: providerRows } = await pool.query(
      `INSERT INTO profiles (id, username, email, full_name)
       VALUES (gen_random_uuid(), $1, $2, 'Whelping Proof Provider')
       RETURNING id`,
      [`whelping_provider_${now}`, `whelping_provider_${now}@mypup.dev`],
    );
    providerUserId = providerRows[0].id as string;

    const { rows: serviceRows } = await pool.query(
      `INSERT INTO pet_service_providers
       (id, user_id, service_type, bio, price, availability, location, is_verified, verification_status)
       VALUES (gen_random_uuid(), $1, 'whelping', 'Verified whelping specialist for proof script.', '125.00', 'By application', 'Proof City', true, 'verified')
       RETURNING id`,
      [providerUserId],
    );
    providerId = serviceRows[0].id as string;

    await pool.query(
      `INSERT INTO whelping_provider_rules
       (provider_id, years_experience, has_breeding_license, has_secure_whelping_space, theft_prevention_plan, welfare_commitment_ack, legal_compliance_ack, background_check_ack)
       VALUES ($1, 4, true, true, 'Badge access, CCTV coverage, signed visitor logs, escalation protocol.', true, true, true)`,
      [providerId],
    );
    logStep(report, "SETUP_WHELPING_PROVIDER", "PASS", `provider=${providerId}`);

    const { rows: buyerRows } = await pool.query(
      `INSERT INTO profiles (id, username, email, full_name)
       VALUES (gen_random_uuid(), $1, $2, 'Whelping Proof Buyer')
       RETURNING id`,
      [`whelping_buyer_${now}`, `whelping_buyer_${now}@mypup.dev`],
    );
    buyerUserId = buyerRows[0].id as string;

    const { rows: waitlistRows } = await pool.query(
      `INSERT INTO whelping_waitlist_entries
       (provider_id, user_id, expected_litter_date, puppy_preference, notes, deposit_amount, deposit_status, status, policy_acknowledged)
       VALUES ($1, $2, NOW() + INTERVAL '30 days', 'family temperament', 'E2E proof entry', 100.00, 'pending', 'pending', true)
       RETURNING id`,
      [providerId, buyerUserId],
    );
    waitlistId = waitlistRows[0].id as string;
    logStep(report, "CREATE_WAITLIST_ENTRY", "PASS", `waitlist=${waitlistId}`);

    const fakeSessionId = `cs_test_whelping_${Date.now()}`;
    const fakePiId = `pi_test_whelping_${Date.now()}`;

    await pool.query(
      `UPDATE whelping_waitlist_entries
       SET stripe_checkout_session_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [waitlistId, fakeSessionId],
    );
    logStep(report, "ATTACH_CHECKOUT_SESSION", "PASS", `session=${fakeSessionId}`);

    const eventObject = {
      id: `evt_test_whelping_${Date.now()}`,
      object: "event",
      api_version: "2025-08-27.basil",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      type: "checkout.session.completed",
      data: {
        object: {
          id: fakeSessionId,
          object: "checkout.session",
          payment_intent: fakePiId,
          metadata: {
            kind: "whelping_waitlist",
            waitlist_id: waitlistId,
            provider_id: providerId,
            user_id: buyerUserId,
          },
        },
      },
    };

    const payload = JSON.stringify(eventObject);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
      timestamp: Math.floor(Date.now() / 1000),
    });

    const webhookRes = await fetch(`${base}/api/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      body: payload,
    });
    const webhookText = await webhookRes.text();
    if (!webhookRes.ok) {
      logStep(report, "POST_WEBHOOK", "FAIL", `status=${webhookRes.status} body=${webhookText}`);
      report.overall = "FAIL";
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
      return;
    }
    logStep(report, "POST_WEBHOOK", "PASS", `status=${webhookRes.status}`);

    const { rows: updatedRows } = await pool.query(
      `SELECT deposit_status, status, stripe_payment_intent_id
       FROM whelping_waitlist_entries
       WHERE id = $1`,
      [waitlistId],
    );
    const updated = updatedRows[0];
    const ok =
      updated?.deposit_status === "paid" &&
      updated?.status === "approved" &&
      updated?.stripe_payment_intent_id === fakePiId;

    if (!ok) {
      logStep(
        report,
        "VERIFY_WAITLIST_PAID",
        "FAIL",
        `deposit_status=${updated?.deposit_status} status=${updated?.status} pi=${updated?.stripe_payment_intent_id}`,
      );
      report.overall = "FAIL";
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
      return;
    }
    logStep(report, "VERIFY_WAITLIST_PAID", "PASS", `waitlist=${waitlistId}`);
    report.overall = "PASS";
  } catch (err: any) {
    logStep(report, "E2E_RUNTIME", "FAIL", err?.message || "Unknown error");
    report.overall = "FAIL";
    process.exitCode = 1;
  } finally {
    try {
      if (waitlistId) {
        await pool.query(`DELETE FROM whelping_waitlist_entries WHERE id = $1`, [waitlistId]);
      }
      if (providerId) {
        await pool.query(`DELETE FROM whelping_provider_rules WHERE provider_id = $1`, [providerId]);
        await pool.query(`DELETE FROM pet_service_providers WHERE id = $1`, [providerId]);
      }
      if (buyerUserId) {
        await pool.query(`DELETE FROM profiles WHERE id = $1`, [buyerUserId]);
      }
      if (providerUserId) {
        await pool.query(`DELETE FROM profiles WHERE id = $1`, [providerUserId]);
      }
      logStep(report, "CLEANUP", "PASS", "Removed proof records");
    } catch (cleanupErr: any) {
      logStep(report, "CLEANUP", "SKIP", cleanupErr?.message || "Cleanup failed");
    }

    await pool.end();
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((e) => {
  console.error("[WHELPING_WAITLIST_E2E] Fatal:", e);
  process.exitCode = 1;
});

