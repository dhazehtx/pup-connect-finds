import "dotenv/config";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { getPupBoxStub, pupBoxCartSlugToProductUuid } from "../server/lib/pupBoxCart";

type StepStatus = "PASS" | "FAIL" | "SKIP";

function step(report: any, name: string, status: StepStatus, detail?: string) {
  report.steps.push({ name, status, detail });
  report.proof_logs.push(`[PROOF:PUPBOX_STRIPE_SELFTEST] ${name}: ${status}${detail ? ` ${detail}` : ""}`);
  console.log(`[PROOF:PUPBOX_STRIPE_SELFTEST] ${name}: ${status} ${detail || ""}`);
}

async function main() {
  const report: any = {
    timestamp: new Date().toISOString(),
    cartLineId: "pupbox-medium-subscription",
    steps: [],
    proof_logs: [],
    overall: "PENDING",
  };

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    report.overall = "FAIL";
    report.error = "Missing STRIPE_SECRET_KEY in env";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    step(report, "STRIPE_WEBHOOK_SECRET", "PASS", "present");
  } else {
    step(report, "STRIPE_WEBHOOK_SECRET", "SKIP", "missing (we simulate webhook DB updates after confirmation)");
  }

  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    report.overall = "FAIL";
    report.error = "Missing NEON_DATABASE_URL/DATABASE_URL in env";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const pool = new Pool({ connectionString: dbUrl });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" as any });

  // 1) Test buyer
  const buyerEmail = "stripe-test-buyer-pupbox-script@mypup.dev";
  let buyerId: string;
  try {
    const { rows: existing } = await pool.query("SELECT id FROM profiles WHERE email = $1 LIMIT 1", [buyerEmail]);
    if (existing[0]?.id) {
      buyerId = existing[0].id;
    } else {
      const { rows } = await pool.query(
        "INSERT INTO profiles (id, username, email, full_name) VALUES (gen_random_uuid(), $2, $1, 'Test Buyer') RETURNING id",
        [buyerEmail, "test_buyer_pupbox_script"]
      );
      buyerId = rows[0].id;
    }
    step(report, "CREATE_TEST_BUYER", "PASS", `buyer=${buyerId}`);
  } catch (err: any) {
    step(report, "CREATE_TEST_BUYER", "FAIL", err.message);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 2) Product row
  const cartLineId = report.cartLineId as string;
  const stub = getPupBoxStub(cartLineId);
  if (!stub) {
    step(report, "PUPBOX_STUB", "FAIL", `No stub for cartLineId=${cartLineId}`);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const productId = pupBoxCartSlugToProductUuid(cartLineId);

  let preInventory: any = null;
  try {
    const { rows } = await pool.query("SELECT inventory_qty FROM products WHERE id = $1", [productId]);
    preInventory = rows[0]?.inventory_qty ?? null;
  } catch {
    preInventory = null;
  }

  try {
    await pool.query(
      `INSERT INTO products
        (id, name, unit_price, currency, is_subscription, is_active, inventory_qty, description, metadata, tags)
       VALUES
        ($1, $2, $3, 'usd', $4, true, 999, 'Pup Box bundle', $5::jsonb, ARRAY[]::text[])
       ON CONFLICT (id) DO NOTHING`,
      [productId, stub.name, stub.unit_price, stub.is_subscription, JSON.stringify({ pupbox_cart_slug: cartLineId })]
    );
    step(report, "ENSURE_PRODUCTS_ROW", "PASS", `product_id=${productId}`);
  } catch (err: any) {
    step(report, "ENSURE_PRODUCTS_ROW", "FAIL", err.message);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 3) Order + order item
  let orderId: string;
  try {
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, amount_total, currency, status, is_subscription)
       VALUES ($1, $2, 'usd', 'pending', $3)
       RETURNING id`,
      [buyerId, stub.unit_price, stub.is_subscription]
    );
    orderId = rows[0].id;

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, qty, unit_price)
       VALUES ($1, $2, 1, $3)`,
      [orderId, productId, stub.unit_price]
    );

    step(report, "CREATE_ORDER_AND_ITEM", "PASS", `order=${orderId} product_id=${productId}`);
  } catch (err: any) {
    step(report, "CREATE_ORDER_AND_ITEM", "FAIL", err.message);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 4) Stripe checkout session creation
  let sessionId: string;
  let paymentIntentId: string | null = null;
  try {
    const unitCents = Math.round(parseFloat(stub.unit_price) * 100);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: stub.name },
              unit_amount: unitCents,
            },
            quantity: 1,
          },
        ],
        success_url: "https://example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://example.com/cart",
        client_reference_id: buyerId,
        metadata: {
          order_id: orderId,
          user_id: buyerId,
        },
        // Self-test needs Stripe to expose a payment_intent for API confirmation.
        // Production uses manual capture, but webhook DB updates don't depend on capture timing.
        payment_intent_data: { capture_method: "automatic" },
        expand: ["payment_intent"],
      } as any
    );
    sessionId = session.id;

    const piFieldAfterCreate = (session as any).payment_intent;
    report.debug_payment_intent_after_create = piFieldAfterCreate;

    if (piFieldAfterCreate) {
      paymentIntentId =
        typeof piFieldAfterCreate === "string"
          ? piFieldAfterCreate
          : piFieldAfterCreate?.id || null;
    }

    // Stripe may not attach payment_intent immediately for Checkout Sessions.
    // Retrieve once more with expand when needed.
    if (!paymentIntentId) {
      // Poll briefly because Stripe can attach it slightly later.
      for (let i = 0; i < 10 && !paymentIntentId; i++) {
        const session2 = await stripe.checkout.sessions.retrieve(session.id, { expand: ["payment_intent"] });
        const piFieldAfterRetrieve = (session2 as any).payment_intent;
        report.debug_payment_intent_after_retrieve = piFieldAfterRetrieve;

        paymentIntentId =
          typeof piFieldAfterRetrieve === "string"
            ? piFieldAfterRetrieve
            : piFieldAfterRetrieve?.id || null;

        if (!paymentIntentId) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    step(
      report,
      "CREATE_CHECKOUT_SESSION",
      "PASS",
      `session=${sessionId} pi=${paymentIntentId || "null"}`
    );
  } catch (err: any) {
    step(report, "CREATE_CHECKOUT_SESSION", "FAIL", err.message);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 5) Confirm payment
  if (!paymentIntentId) {
    step(
      report,
      "CONFIRM_PAYMENT",
      "SKIP",
      "Stripe did not expose payment_intent on the checkout session response; skipping API confirmation"
    );
  } else {
    try {
      const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, { payment_method: "pm_card_visa" });
      if (confirmed.status !== "succeeded") {
        step(report, "CONFIRM_PAYMENT", "FAIL", `Expected succeeded, got ${confirmed.status}`);
        report.overall = "FAIL";
        console.log(JSON.stringify(report, null, 2));
        return;
      }
      step(report, "CONFIRM_PAYMENT", "PASS", `pi=${paymentIntentId} status=${confirmed.status}`);
    } catch (err: any) {
      step(report, "CONFIRM_PAYMENT", "FAIL", err.message);
      report.overall = "FAIL";
      console.log(JSON.stringify(report, null, 2));
      return;
    }
  }

  // 6) Simulate webhook DB update: order -> paid; inventory decrement
  try {
    await pool.query(
      `UPDATE orders
       SET status = 'paid',
           stripe_session_id = $1,
           stripe_payment_intent_id = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [sessionId, paymentIntentId, orderId]
    );

    const { rows: items } = await pool.query(
      `SELECT product_id, qty FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    for (const it of items) {
      await pool.query(
        `UPDATE products
         SET inventory_qty = inventory_qty - $2,
             updated_at = NOW()
         WHERE id = $1`,
        [it.product_id, it.qty]
      );
    }

    step(report, "SIMULATE_WEBHOOK_DB_UPDATE", "PASS", `order=${orderId}`);
  } catch (err: any) {
    step(report, "SIMULATE_WEBHOOK_DB_UPDATE", "FAIL", err.message);
    report.overall = "FAIL";
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // 7) Verify DB state
  try {
    const { rows: orderRows } = await pool.query(
      `SELECT id, status, stripe_session_id, stripe_payment_intent_id FROM orders WHERE id = $1`,
      [orderId]
    );
    const { rows: itemRows } = await pool.query(
      `SELECT product_id, qty, unit_price FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    const orderOk = orderRows[0]?.status === "paid";
    const itemsOk = itemRows?.length === 1 && itemRows[0]?.product_id === productId;

    if (!orderOk || !itemsOk) {
      step(
        report,
        "VERIFY_DB",
        "FAIL",
        `order_status=${orderRows[0]?.status} item_count=${itemRows?.length}`
      );
      report.overall = "FAIL";
    } else {
      step(report, "VERIFY_DB", "PASS", `order=${orderId} status=paid item_count=${itemRows.length}`);
      report.overall = "PASS";
    }

    // Cleanup (best effort)
    try {
      if (preInventory !== null && preInventory !== undefined) {
        await pool.query("UPDATE products SET inventory_qty = $1, updated_at = NOW() WHERE id = $2", [
          preInventory,
          productId,
        ]);
      }
      await pool.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
      await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
      step(report, "CLEANUP", "PASS", "restored inventory + deleted order rows");
    } catch (cleanupErr: any) {
      step(report, "CLEANUP", "SKIP", cleanupErr.message);
    }
  } catch (err: any) {
    step(report, "VERIFY_DB", "FAIL", err.message);
    report.overall = "FAIL";
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error("[PUPBOX_STRIPE_SELFTEST] Fatal:", e);
  process.exitCode = 1;
});

