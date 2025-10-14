import { Router } from "express";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../lib/config";
import { 
  upsertProviderStatus, 
  markBookingPaid, 
  logStripeEvent, 
  handleTransferResult, 
  handleRefund 
} from "../../lib/stripe-handlers";
import { withDbIdempotency } from "../../lib/idempotency";
import { Pool } from '@neondatabase/serverless';
import { ensureVerifiedBadge } from "../../lib/badges";

const router = Router();

// Initialize Stripe only if we have a secret key
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Webhook endpoint needs raw body
router.post("/", async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const body = req.body;
  
  console.log('[STRIPE WEBHOOK] Received webhook');

  // Check if Stripe is configured
  if (!stripe) {
    console.log('[STRIPE WEBHOOK] Stripe not configured, returning success');
    return res.json({ received: true, status: 'stripe_not_configured' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.log('[STRIPE WEBHOOK] Webhook secret not configured, returning success');
    return res.json({ received: true, status: 'webhook_secret_not_configured' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Process webhook with idempotency protection
    await withDbIdempotency(event.id, async () => {
      await logStripeEvent(event); // audit table

      console.log('[STRIPE WEBHOOK] Processing event:', event.type);

      switch (event.type) {
        case 'account.updated': {
          const acct = event.data.object as Stripe.Account;
          await upsertProviderStatus({
            stripeAccountId: acct.id,
            chargesEnabled: acct.charges_enabled || false,
            payoutsEnabled: acct.payouts_enabled || false,
            requirementsDue: acct.requirements?.currently_due ?? [],
          });
          
          // Check if provider is now fully verified and add badge
          const { rows } = await pool.query<{ user_id: string }>(
            'SELECT user_id FROM providers WHERE stripe_account_id = $1',
            [acct.id]
          );
          if (rows[0]?.user_id) {
            await ensureVerifiedBadge(rows[0].user_id);
          }
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await markBookingPaid({ checkoutSessionId: session.id });
          // TODO: If immediate payout enabled, create transfer to provider here
          break;
        }

        case 'payment_intent.succeeded': {
          // Optional: Handle PaymentIntent success if needed
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('[STRIPE WEBHOOK] Payment succeeded:', paymentIntent.id);
          break;
        }

        case 'transfer.created':
        case 'transfer.reversed': {
          await handleTransferResult(event);
          break;
        }

        case 'charge.refunded':
        case 'refund.created': {
          await handleRefund(event);
          break;
        }

        // Legacy: Identity verification events
        case "identity.verification_session.verified":
        case "identity.verification_session.canceled":
        case "identity.verification_session.requires_input": {
          const session = event.data.object as Stripe.Identity.VerificationSession;
          const status = event.type === "identity.verification_session.verified" ? "completed" : "failed";

          console.log('[STRIPE WEBHOOK] Updating ID verification status:', { 
            sessionId: session.id, 
            status, 
            eventType: event.type 
          });

          const query = `
            UPDATE provider_applications 
            SET step3_id_status = $1, updated_at = NOW() 
            WHERE stripe_session_id = $2
          `;
          const result = await pool.query(query, [status, session.id]);
          console.log('[STRIPE WEBHOOK] Updated applications:', result.rowCount);
          break;
        }

        default:
          console.log('[STRIPE WEBHOOK] Unhandled event type:', event.type);
          break;
      }
    });

    return res.json({ received: true });
  } catch (error: any) {
    console.error("[STRIPE WEBHOOK] Error processing webhook:", error);
    return res.status(500).json({ 
      error: "Webhook handling error",
      details: error.message 
    });
  }
});

export { router as webhookRouter };