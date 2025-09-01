import { Router } from "express";
import Stripe from "stripe";
import { serverSupabase } from "../../lib/supabaseServer";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2024-06-20" as any 
});

// Webhook endpoint needs raw body
router.post("/", async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  // Note: For webhook to work properly, you need raw body buffer
  // This would typically require express.raw() middleware
  const body = req.body;
  
  console.log('[STRIPE WEBHOOK] Received webhook');

  // For development, we might not have webhook secret set up yet
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('[STRIPE WEBHOOK] Warning: No webhook secret configured, skipping signature verification');
    return res.json({ received: true, status: 'no_secret_configured' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', e.message);
    return res.status(400).json({ 
      error: `Webhook signature verification failed: ${e.message}` 
    });
  }

  try {
    console.log('[STRIPE WEBHOOK] Processing event:', event.type);

    if (event.type === "identity.verification_session.verified" ||
        event.type === "identity.verification_session.canceled" ||
        event.type === "identity.verification_session.requires_input") {

      const session = event.data.object as Stripe.Identity.VerificationSession;
      const status = event.type === "identity.verification_session.verified" ? "completed" : "failed";

      console.log('[STRIPE WEBHOOK] Updating verification status:', { 
        sessionId: session.id, 
        status, 
        eventType: event.type 
      });

      const supabase = serverSupabase();
      const { data, error } = await supabase
        .from("provider_applications")
        .update({ 
          step3_id_status: status, 
          updated_at: new Date().toISOString() 
        })
        .eq("stripe_session_id", session.id)
        .select();

      if (error) {
        console.error('[STRIPE WEBHOOK] Database update error:', error);
        throw error;
      }

      console.log('[STRIPE WEBHOOK] Successfully updated applications:', data?.length || 0);
    }

    return res.json({ received: true });
  } catch (e: any) {
    console.error("[STRIPE WEBHOOK] Error:", e);
    return res.status(500).json({ 
      error: "Webhook handling error" 
    });
  }
});

export { router as webhookRouter };