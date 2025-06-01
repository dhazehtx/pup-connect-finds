
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook verified", { eventType: event.type, eventId: event.id });

    // Check if we've already processed this event
    const { data: existingWebhook } = await supabaseClient
      .from("stripe_webhooks")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingWebhook) {
      logStep("Event already processed", { eventId: event.id });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Store webhook event
    await supabaseClient.from("stripe_webhooks").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data,
      processed: false,
    });

    // Process different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event, supabaseClient, stripe);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event, supabaseClient, stripe);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event, supabaseClient, stripe);
        break;
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    // Mark webhook as processed
    await supabaseClient
      .from("stripe_webhooks")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    logStep("Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleSubscriptionChange(event: any, supabase: any, stripe: any) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  logStep("Processing subscription change", { 
    subscriptionId: subscription.id, 
    status: subscription.status,
    customerId 
  });

  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    throw new Error("Customer not found");
  }

  const email = customer.email;
  if (!email) {
    throw new Error("Customer email not found");
  }

  let subscriptionTier = null;
  let subscriptionEnd = null;
  let trialEnd = null;
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  if (isActive && subscription.items?.data?.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;
    
    if (amount <= 799) {
      subscriptionTier = "Basic";
    } else if (amount <= 1499) {
      subscriptionTier = "Pro";
    } else {
      subscriptionTier = "Enterprise";
    }

    subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    if (subscription.trial_end) {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
    }
  }

  // Update subscriber record
  await supabase.from("subscribers").upsert({
    email,
    stripe_customer_id: customerId,
    subscribed: isActive,
    subscription_tier: subscriptionTier,
    subscription_end: subscriptionEnd,
    trial_end: trialEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  // Update analytics if subscription was cancelled
  if (event.type === "customer.subscription.deleted") {
    await updateAnalytics(supabase, 'cancelled_subscriptions', 1);
  } else if (event.type === "customer.subscription.created") {
    await updateAnalytics(supabase, 'new_subscriptions', 1);
  }

  logStep("Subscription updated successfully", { email, subscriptionTier, isActive });
}

async function handlePaymentSucceeded(event: any, supabase: any, stripe: any) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  const amountPaid = invoice.amount_paid / 100; // Convert from cents

  logStep("Processing payment succeeded", { customerId, amountPaid });

  await updateAnalytics(supabase, 'total_revenue', amountPaid);
}

async function handlePaymentFailed(event: any, supabase: any, stripe: any) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  
  logStep("Processing payment failed", { customerId, invoiceId: invoice.id });
  
  // Could implement notification logic here
}

async function updateAnalytics(supabase: any, metric: string, value: number) {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase.rpc('upsert_analytics', {
    analytics_date: today,
    metric_name: metric,
    metric_value: value
  });

  if (error) {
    console.error('Analytics update failed:', error);
  }
}
