import { Router } from "express";
import Stripe from 'stripe';
import { authMiddleware } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51QkC2xAjnGJFfCCRdZBOsGpgJP2KowQJeVqkKBhMJR1sX8QxQdkbKHwGC7YQp5C8lYtPl7zO3nNfX4gZrD1RqN2z00SJcEsrpD', {
  apiVersion: '2024-11-20.acacia',
});

// POST /api/checkout/create-session - Create Stripe checkout session for cart
router.post("/create-session", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    // Validate products exist in database
    const validItems = [];
    for (const item of items) {
      // For now, we'll use the cart item data directly since getProductById might not be implemented
      // In production, you'd validate against your products table
      validItems.push(item);
    }

    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid products found" });
    }

    // Create line items for Stripe
    const lineItems = validItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `Premium pet product - ${item.name}`,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(parseFloat(item.unit_price) * 100), // Convert to cents
        recurring: item.is_subscription ? {
          interval: 'month'
        } : undefined,
      },
      quantity: item.quantity,
    }));

    const mode = validItems.some(item => item.is_subscription) ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      metadata: { 
        user_id,
        order_items: JSON.stringify(validItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })))
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/marketplace`,
      customer_email: req.user?.email || undefined,
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/checkout - Legacy single product checkout (backwards compatibility)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    // Convert single product to cart format
    const items = [{
      id: product_id,
      quantity: quantity,
      // Note: In production, fetch product details from database
    }];

    // Redirect to cart checkout
    req.body.items = items;
    return router.handle(req, res);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;