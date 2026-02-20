import { Router } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-08-27.basil" as any
});

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

    console.log(`[PROOF:CHECKOUT:SESSION_START] user=${user_id} items=${cartItems.length}`);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let amountTotal = 0;

    for (const item of cartItems) {
      if (!item.id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: `Invalid cart item: ${JSON.stringify(item)}` });
      }

      const product = await storage.getProduct(item.id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.id}` });
      }

      const unitPriceCents = Math.round(parseFloat(product.unit_price) * 100);
      amountTotal += unitPriceCents * item.quantity;

      if (product.stripe_price_id) {
        lineItems.push({
          price: product.stripe_price_id,
          quantity: item.quantity,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: product.currency || 'usd',
            product_data: {
              name: product.name,
              ...(product.image_url ? { images: [product.image_url] } : {}),
            },
            unit_amount: unitPriceCents,
          },
          quantity: item.quantity,
        });
      }
    }

    const order = await storage.createOrder({
      user_id,
      amount_total: (amountTotal / 100).toFixed(2),
      currency: 'usd',
      status: 'pending',
    });

    for (const item of cartItems) {
      const product = await storage.getProduct(item.id);
      if (product) {
        await storage.createOrderItem({
          order_id: order.id,
          product_id: item.id,
          qty: item.quantity,
          unit_price: product.unit_price,
        });
      }
    }

    console.log(`[PROOF:CHECKOUT:ORDER_CREATED] order=${order.id} amount=${(amountTotal / 100).toFixed(2)}`);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      client_reference_id: user_id,
      metadata: {
        order_id: order.id,
        user_id: user_id,
      },
    });

    await storage.updateOrder(order.id, {
      stripe_session_id: session.id,
    });

    console.log(`[PROOF:CHECKOUT:SESSION_CREATED] order=${order.id} session=${session.id}`);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("[PROOF:CHECKOUT:ERROR]", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/status", async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const order = await storage.getOrderBySessionId(sessionId);
    if (!order) {
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
    console.error("[PROOF:CHECKOUT:STATUS_ERROR]", error.message);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

export default router;
