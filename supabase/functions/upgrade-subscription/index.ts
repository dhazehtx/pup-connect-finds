
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPGRADE-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Upgrade function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { newTier } = await req.json();
    if (!newTier) throw new Error("New tier is required");

    logStep("User authenticated", { userId: user.id, email: user.email, newTier });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found");
    }
    const customerId = customers.data[0].id;

    // Get current subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscription = subscriptions.data[0];
    logStep("Found active subscription", { subscriptionId: subscription.id });

    // Define new pricing
    const pricing = {
      'Basic': { amount: 799, name: 'Basic Plan' },
      'Pro': { amount: 1499, name: 'Pro Plan' },
      'Enterprise': { amount: 2999, name: 'Enterprise Plan' }
    };

    const newPlan = pricing[newTier as keyof typeof pricing];
    if (!newPlan) throw new Error("Invalid subscription tier");

    // Update subscription with proration
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price_data: {
          currency: "usd",
          product_data: { name: newPlan.name },
          unit_amount: newPlan.amount,
          recurring: { interval: "month" },
        },
      }],
      proration_behavior: 'create_prorations',
    });

    logStep("Subscription upgraded successfully", { newTier, subscriptionId: updatedSubscription.id });

    // Update analytics
    await updateAnalytics(supabaseClient, 'upgrades', 1);

    return new Response(JSON.stringify({ 
      success: true, 
      subscriptionId: updatedSubscription.id,
      newTier 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in upgrade-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

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
