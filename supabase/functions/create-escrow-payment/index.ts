
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ESCROW-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Create escrow payment started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { listingId, amount, meetingLocation, meetingTime } = await req.json();
    if (!listingId || !amount) throw new Error("Listing ID and amount are required");

    logStep("User authenticated", { userId: user.id, email: user.email, listingId, amount });

    // Get listing details
    const { data: listing, error: listingError } = await supabaseClient
      .from('dog_listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) throw new Error("Listing not found");
    if (listing.user_id === user.id) throw new Error("Cannot create escrow for your own listing");

    // Calculate commission (8% default)
    const commissionRate = 0.08;
    const commissionAmount = amount * commissionRate;
    const sellerAmount = amount - commissionAmount;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Create payment intent with manual capture (for escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      capture_method: "manual", // This allows us to hold funds
      metadata: {
        listingId,
        buyerId: user.id,
        sellerId: listing.user_id,
        type: "escrow_payment"
      },
      description: `Escrow payment for ${listing.dog_name} - ${listing.breed}`,
    });

    // Store payment intent
    await supabaseClient.from("payment_intents").insert({
      stripe_payment_intent_id: paymentIntent.id,
      listing_id: listingId,
      buyer_email: user.email,
      amount,
      status: paymentIntent.status,
    });

    // Create escrow transaction record
    const { data: escrowTransaction, error: escrowError } = await supabaseClient
      .from("escrow_transactions")
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.user_id,
        amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: "pending",
        meeting_location: meetingLocation,
        meeting_scheduled_at: meetingTime,
      })
      .select()
      .single();

    if (escrowError) throw new Error(`Failed to create escrow transaction: ${escrowError.message}`);

    logStep("Escrow payment created successfully", { 
      paymentIntentId: paymentIntent.id,
      escrowId: escrowTransaction.id 
    });

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      escrowTransactionId: escrowTransaction.id,
      commissionAmount,
      sellerAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-escrow-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
