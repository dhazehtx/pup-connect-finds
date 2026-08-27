import { Router } from "express";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../lib/config";

const router = Router();

const stripe = new Stripe(STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-08-27.basil"
});

const endpointSecret = STRIPE_WEBHOOK_SECRET;

// Stripe webhook endpoint.
// Signature verification is MANDATORY. There is no "skip verification" path —
// an unverified body could forge a paid order. Missing secret => fail closed.
router.post("/stripe", async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!endpointSecret) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is not configured — refusing to process unverified webhook.');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig as string, endpointSecret);
  } catch (err: any) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      // CONSOLIDATION: delegate to the single canonical, DB-idempotent processor
      // used by /api/stripe/webhook. This handler previously created an order
      // UNCONDITIONALLY (no idempotency, no pending-guard), so a Stripe retry
      // produced duplicate orders + double inventory decrements. withDbIdempotency
      // shares the stripe_idempotency table across all webhook handlers, so any
      // event is processed exactly once regardless of which endpoint(s) Stripe
      // delivers to. processCheckoutSessionCompleted handles both order_id and the
      // legacy product_id metadata and only advances a pending order.
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const { withDbIdempotency } = await import('../lib/idempotency');
        const { processCheckoutSessionCompleted } = await import('../lib/checkoutSessionWebhook');
        const { logStripeEvent } = await import('../lib/stripe-handlers');
        await withDbIdempotency(event.id, async () => {
          await logStripeEvent(event);
          await processCheckoutSessionCompleted(session);
        });
      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
      break;
    }

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