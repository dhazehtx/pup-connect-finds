import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router } from "express";
import type Stripe from "stripe";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";
import { getStripe } from "../lib/stripeLazy";
import { getOrCreateStripeCustomer } from "../lib/stripeCustomer";

const router = Router();

router.post("/session", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { cartItems } = req.body;
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cartItems array is required" });
    }

    debugApiLog(`[PROOF:CHECKOUT:SESSION_START] user=${user_id} items=${cartItems.length}`);

    const resolved: { product: Awaited<ReturnType<typeof storage.getProduct>>; qty: number }[] = [];
    for (const item of cartItems) {
      if (!item.id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: `Invalid cart item: ${JSON.stringify(item)}` });
      }
      const product = await storage.getProduct(item.id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.id}` });
      }
      resolved.push({ product, qty: item.quantity });
    }

    const anySubscription = resolved.some(({ product }) => product!.is_subscription);
    const anyOneTime = resolved.some(({ product }) => !product!.is_subscription);
    if (anySubscription && anyOneTime) {
      return res.status(400).json({
        error:
          "Cart mixes subscription and one-time products. Complete subscription checkout separately from one-time purchases.",
      });
    }

    const mode: Stripe.Checkout.SessionCreateParams.Mode = anySubscription ? "subscription" : "payment";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let amountTotal = 0;

    for (const { product, qty } of resolved) {
      if (!product) continue;
      const unitPriceCents = Math.round(parseFloat(product.unit_price) * 100);
      amountTotal += unitPriceCents * qty;

      if (mode === "subscription") {
        if (!product.stripe_price_id) {
          return res.status(400).json({
            error: `Subscription product "${product.name}" is missing stripe_price_id`,
          });
        }
        lineItems.push({
          price: product.stripe_price_id,
          quantity: qty,
        });
      } else {
        // One-time items: build an inline price from unit_price so checkout is
        // Stripe-mode-agnostic. The stored stripe_price_id may be a LIVE-mode
        // price, which a TEST-mode key cannot use ("No such price … exists in
        // live mode, but a test mode key was used"). Only attach an image when
        // it is an absolute URL — Stripe rejects the app-relative image_url
        // paths (e.g. "/products/…").
        const absoluteImages =
          product.image_url && /^https?:\/\//i.test(product.image_url)
            ? [product.image_url]
            : undefined;
        lineItems.push({
          price_data: {
            currency: product.currency || "usd",
            product_data: {
              name: product.name,
              ...(absoluteImages ? { images: absoluteImages } : {}),
            },
            unit_amount: unitPriceCents,
          },
          quantity: qty,
        });
      }
    }

    const order = await storage.createOrder({
      user_id,
      amount_total: (amountTotal / 100).toFixed(2),
      currency: "usd",
      status: "pending",
      is_subscription: anySubscription,
    });

    for (const { product, qty } of resolved) {
      if (product) {
        await storage.createOrderItem({
          order_id: order.id,
          product_id: product.id,
          qty,
          unit_price: product.unit_price,
        });
      }
    }

    debugApiLog(`[PROOF:CHECKOUT:ORDER_CREATED] order=${order.id} amount=${(amountTotal / 100).toFixed(2)} mode=${mode}`);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      client_reference_id: user_id,
      metadata: {
        order_id: order.id,
        user_id: user_id,
      },
    };

    if (mode === "subscription") {
      const email = (req.user as { email?: string } | undefined)?.email;
      sessionParams.customer = await getOrCreateStripeCustomer(user_id, email);
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    let totalCents = amountTotal;
    try {
      const retrieved = await getStripe().checkout.sessions.retrieve(session.id);
      if (typeof retrieved.amount_total === "number" && retrieved.amount_total > 0) {
        totalCents = retrieved.amount_total;
      }
    } catch (e: any) {
      debugApiWarn("[CHECKOUT:SESSION_RETRIEVE]", e?.message || e);
    }

    await storage.updateOrder(order.id, {
      stripe_session_id: session.id,
      checkout_session_id: session.id,
      amount_total: (totalCents / 100).toFixed(2),
    });

    debugApiLog(`[PROOF:CHECKOUT:SESSION_CREATED] order=${order.id} session=${session.id}`);

    res.json({ url: session.url });
  } catch (error: any) {
    // Surface the real cause server-side. Stripe error message/type/code are
    // safe to log (they never contain secret keys); do NOT echo them to the
    // client verbatim (a message can leak internal price/product ids).
    debugApiWarn(
      "[PROOF:CHECKOUT:ERROR]",
      JSON.stringify({
        message: error?.message,
        type: error?.type,
        code: error?.code,
        statusCode: error?.statusCode,
        param: error?.param,
      }),
    );
    const isStripeConfigError =
      error?.type === "StripeInvalidRequestError" &&
      /No such price|No such product|test mode|live mode/i.test(error?.message || "");
    res.status(isStripeConfigError ? 400 : 500).json({
      error: "Failed to create checkout session",
      code: isStripeConfigError ? "STRIPE_PRICE_UNAVAILABLE" : "CHECKOUT_FAILED",
    });
  }
});

router.get("/status", authMiddleware, async (req, res) => {
  try {
    // SECURITY: require auth and only return the caller's OWN order. Previously
    // anyone with a session_id could read order status/amount (IDOR).
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const order = await storage.getOrderBySessionId(sessionId);
    if (!order || order.user_id !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      order_id: order.id,
      status: order.status,
      amount_total: order.amount_total,
      currency: order.currency,
      created_at: order.created_at,
    });
  } catch (error: any) {
    debugApiLog("[PROOF:CHECKOUT:STATUS_ERROR]", error.message);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

export default router;
