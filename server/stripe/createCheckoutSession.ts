import Stripe from "stripe";
import { storage } from "../storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
  apiVersion: "2025-08-27.basil" 
});

export async function createCheckoutSession(
  user_id: string,
  product_id: string,
  quantity: number = 1
): Promise<string> {
  // 1. Fetch product details from database
  const product = await storage.getProductById(product_id);
  
  if (!product) {
    throw new Error("Invalid product_id");
  }

  if (!product.stripe_price_id) {
    throw new Error("Product does not have Stripe price configured");
  }

  // 2. Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: product.is_subscription ? "subscription" : "payment",
    line_items: [{ 
      price: product.stripe_price_id, 
      quantity 
    }],
    client_reference_id: user_id,
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/cancel`,
    metadata: {
      user_id,
      product_id,
      quantity: quantity.toString()
    }
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}