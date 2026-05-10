import "dotenv/config";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { getPupBoxStub, pupBoxCartSlugToProductUuid } from "../server/lib/pupBoxCart";

type StepStatus = "PASS" | "FAIL" | "SKIP";

function logStep(report: any, name: string, status: StepStatus, detail?: string) {
  report.steps.push({ name, status, detail });
  const line = `[PROOF:STRIPE_WEBHOOK_E2E] ${name}: ${status}${detail ? ` ${detail}` : ""}`;
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

  if (!stripeSecret) {
    logStep(report, "STRIPE_SECRET_KEY", "FAIL", "Missing STRIPE_SECRET_KEY");
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  if (!webhookSecret) {
    logStep(report, "STRIPE_WEBHOOK_SECRET", "FAIL", "Missing STRIPE_WEBHOOK_SECRET");
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  if (!dbUrl) {
    logStep(report, "DATABASE_URL", "FAIL", "Missing DATABASE_URL/NEON_DATABASE_URL");
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }

  logStep(report, "ENV_CHECK", "PASS", `base=${base}`);

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" as any });
  const pool = new Pool({ connectionString: dbUrl });

  const cartSlug = "pupbox-medium-subscription";
  const stub = getPupBoxStub(cartSlug);
  if (!stub) {
    logStep(report, "PUPBOX_STUB", "FAIL", `Missing stub for ${cartSlug}`);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }

  const buyerEmail = `stripe-webhook-proof-${Date.now()}@mypup.dev`;
  const buyerUsername = `stripe_webhook_proof_${Date.now()}`;
  const productId = pupBoxCartSlugToProductUuid(cartSlug);
  let orderId = "";
  let preInventory: number | null = null;

  try {
    const { rows: buyerRows } = await pool.query(
      `INSERT INTO profiles (id, username, email, full_name)
       VALUES (gen_random_uuid(), $1, $2, 'Stripe Webhook Proof Buyer')
       RETURNING id`,
      [buyerUsername, buyerEmail]
    );
    const buyerId = buyerRows[0].id as string;
    logStep(report, "CREATE_TEST_BUYER", "PASS", `buyer=${buyerId}`);

    const { rows: invRows } = await pool.query(
      "SELECT inventory_qty FROM products WHERE id = $1 LIMIT 1",
      [productId]
    );
    preInventory = typeof invRows[0]?.inventory_qty === "number" ? invRows[0].inventory_qty : null;

    await pool.query(
      `INSERT INTO products
        (id, name, unit_price, currency, is_subscription, is_active, inventory_qty, description, metadata, tags)
       VALUES
        ($1, $2, $3, 'usd', $4, true, 999, 'Pup Box bundle', $5::jsonb, ARRAY[]::text[])
       ON CONFLICT (id) DO NOTHING`,
      [productId, stub.name, stub.unit_price, stub.is_subscription, JSON.stringify({ pupbox_cart_slug: cartSlug })]
    );
    logStep(report, "ENSURE_PRODUCT", "PASS", `product=${productId}`);

    const { rows: orderRows } = await pool.query(
      `INSERT INTO orders (user_id, amount_total, currency, status)
       VALUES ($1, $2, 'usd', 'pending')
       RETURNING id`,
      [buyerId, stub.unit_price]
    );
    orderId = orderRows[0].id as string;

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, qty, unit_price)
       VALUES ($1, $2, 1, $3)`,
      [orderId, productId, stub.unit_price]
    );
    logStep(report, "CREATE_PENDING_ORDER", "PASS", `order=${orderId}`);

    const fakeSessionId = `cs_test_webhook_proof_${Date.now()}`;
    const fakePiId = `pi_webhook_proof_${Date.now()}`;
    const eventObject = {
      id: `evt_webhook_proof_${Date.now()}`,
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
            order_id: orderId,
            user_id: buyerId,
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

    const { rows: orderAfter } = await pool.query(
      "SELECT status, stripe_session_id, stripe_payment_intent_id FROM orders WHERE id = $1",
      [orderId]
    );
    const { rows: productAfter } = await pool.query(
      "SELECT inventory_qty FROM products WHERE id = $1",
      [productId]
    );

    const orderStatus = orderAfter[0]?.status;
    const orderSession = orderAfter[0]?.stripe_session_id;
    const orderPi = orderAfter[0]?.stripe_payment_intent_id;
    const postInventory = productAfter[0]?.inventory_qty;

    const orderOk = orderStatus === "paid" && orderSession === fakeSessionId && orderPi === fakePiId;
    const inventoryOk =
      typeof postInventory === "number" &&
      (preInventory === null ? postInventory <= 998 : postInventory === preInventory - 1);

    if (!orderOk || !inventoryOk) {
      logStep(
        report,
        "VERIFY_DB_AFTER_WEBHOOK",
        "FAIL",
        `orderStatus=${orderStatus} orderSession=${orderSession} orderPi=${orderPi} inventory=${postInventory}`
      );
      report.overall = "FAIL";
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
      return;
    }

    logStep(
      report,
      "VERIFY_DB_AFTER_WEBHOOK",
      "PASS",
      `order=${orderId} status=paid inventory=${postInventory}`
    );

    report.overall = "PASS";
  } catch (err: any) {
    logStep(report, "E2E_RUNTIME", "FAIL", err?.message || "Unknown error");
    report.overall = "FAIL";
    process.exitCode = 1;
  } finally {
    try {
      if (orderId) {
        await pool.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
        await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
      }
      if (preInventory !== null) {
        await pool.query("UPDATE products SET inventory_qty = $1, updated_at = NOW() WHERE id = $2", [preInventory, productId]);
      }
      logStep(report, "CLEANUP", "PASS", "Removed test order and restored inventory");
    } catch (cleanupErr: any) {
      logStep(report, "CLEANUP", "SKIP", cleanupErr?.message || "Cleanup failed");
    }

    await pool.end();
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((e) => {
  console.error("[STRIPE_WEBHOOK_E2E] Fatal:", e);
  process.exitCode = 1;
});
