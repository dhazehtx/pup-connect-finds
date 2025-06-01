
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-ESCROW] ${step}${detailsStr}`);
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
    logStep("Escrow confirmation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { escrowTransactionId, confirmationType } = await req.json();
    if (!escrowTransactionId || !confirmationType) {
      throw new Error("Escrow transaction ID and confirmation type are required");
    }

    // Get escrow transaction
    const { data: escrowTransaction, error: escrowError } = await supabaseClient
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowTransactionId)
      .single();

    if (escrowError || !escrowTransaction) throw new Error("Escrow transaction not found");

    // Verify user is authorized to confirm
    const isBuyer = escrowTransaction.buyer_id === user.id;
    const isSeller = escrowTransaction.seller_id === user.id;
    
    if (!isBuyer && !isSeller) {
      throw new Error("Not authorized to confirm this transaction");
    }

    if (confirmationType === "buyer" && !isBuyer) {
      throw new Error("Only buyer can provide buyer confirmation");
    }

    if (confirmationType === "seller" && !isSeller) {
      throw new Error("Only seller can provide seller confirmation");
    }

    const now = new Date().toISOString();
    let updateData: any = {};

    if (confirmationType === "buyer") {
      if (escrowTransaction.buyer_confirmed_at) {
        throw new Error("Buyer has already confirmed this transaction");
      }
      updateData.buyer_confirmed_at = now;
      updateData.status = escrowTransaction.seller_confirmed_at ? "completed" : "buyer_confirmed";
    } else if (confirmationType === "seller") {
      if (escrowTransaction.seller_confirmed_at) {
        throw new Error("Seller has already confirmed this transaction");
      }
      updateData.seller_confirmed_at = now;
      updateData.status = escrowTransaction.buyer_confirmed_at ? "completed" : "seller_confirmed";
    }

    // Update escrow transaction
    const { data: updatedTransaction, error: updateError } = await supabaseClient
      .from('escrow_transactions')
      .update(updateData)
      .eq('id', escrowTransactionId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update escrow transaction: ${updateError.message}`);

    // If both parties have confirmed, release funds
    if (updatedTransaction.status === "completed") {
      await releaseFunds(updatedTransaction, supabaseClient);
    }

    logStep("Escrow confirmation successful", { 
      escrowId: escrowTransactionId,
      confirmationType,
      status: updatedTransaction.status 
    });

    return new Response(JSON.stringify({ 
      success: true,
      status: updatedTransaction.status,
      bothConfirmed: updatedTransaction.status === "completed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in confirm-escrow", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function releaseFunds(escrowTransaction: any, supabase: any) {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Capture the payment intent to release funds
    await stripe.paymentIntents.capture(escrowTransaction.stripe_payment_intent_id);
    
    // Update transaction status
    await supabase
      .from('escrow_transactions')
      .update({ 
        funds_released_at: new Date().toISOString(),
        status: "completed"
      })
      .eq('id', escrowTransaction.id);

    logStep("Funds released successfully", { escrowId: escrowTransaction.id });
  } catch (error) {
    logStep("ERROR releasing funds", { error: error.message });
    throw error;
  }
}
