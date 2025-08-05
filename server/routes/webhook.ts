import { Router } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
  apiVersion: "2025-07-30.basil" 
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe webhook endpoint
router.post("/stripe", async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    if (!endpointSecret) {
      // For development, skip signature verification
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    }
  } catch (err: any) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        console.log('✅ Payment succeeded:', session.id);
        
        // Extract metadata
        const userId = session.client_reference_id || session.metadata?.user_id;
        const productId = session.metadata?.product_id;
        const quantity = parseInt(session.metadata?.quantity || '1');
        
        if (!userId || !productId) {
          console.error('Missing required metadata in session:', { userId, productId });
          break;
        }

        // Get product details
        const product = await storage.getProduct(productId);
        if (!product) {
          console.error('Product not found:', productId);
          break;
        }

        // Create order record
        const order = await storage.createOrder({
          user_id: userId,
          amount_total: (session.amount_total! / 100).toString(), // Convert from cents
          status: 'paid',
          stripe_session_id: session.id
        });

        // Create order item
        await storage.createOrderItem({
          order_id: order.id,
          product_id: productId,
          qty: quantity,
          unit_price: product.unit_price
        });

        console.log('✅ Order created successfully:', order.id);
        
      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('💰 Payment intent succeeded:', paymentIntent.id);
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object as Stripe.PaymentMethod;
      console.log('💳 Payment method attached:', paymentMethod.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;