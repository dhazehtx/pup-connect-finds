import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESOLVE-DISPUTE] ${step}${detailsStr}`);
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
    logStep("Dispute resolution started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { escrowTransactionId, resolution, resolutionNotes, refundAmount } = await req.json();
    if (!escrowTransactionId || !resolution || !resolutionNotes) {
      throw new Error("Missing required fields");
    }

    // Get escrow transaction
    const { data: escrowTransaction, error: escrowError } = await supabaseClient
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowTransactionId)
      .single();

    if (escrowError || !escrowTransaction) throw new Error("Escrow transaction not found");

    if (escrowTransaction.status !== "disputed") {
      throw new Error("Transaction is not in disputed status");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const now = new Date().toISOString();

    let finalStatus = "completed";
    let resolutionData: any = {
      dispute_resolved_at: now,
      dispute_resolution: resolution,
      dispute_resolution_notes: resolutionNotes,
      status: finalStatus
    };

    // Handle different resolution types
    switch (resolution) {
      case 'refund_buyer':
        // Cancel/refund the payment intent
        try {
          await stripe.paymentIntents.cancel(escrowTransaction.stripe_payment_intent_id);
          logStep("Payment intent cancelled for full refund");
        } catch (stripeError: any) {
          // If already captured, create a refund
          if (stripeError.code === 'payment_intent_unexpected_state') {
            await stripe.refunds.create({
              payment_intent: escrowTransaction.stripe_payment_intent_id,
              amount: Math.round(escrowTransaction.amount * 100) // Convert to cents
            });
            logStep("Refund created for captured payment");
          } else {
            throw stripeError;
          }
        }
        resolutionData.refund_amount = escrowTransaction.amount;
        break;

      case 'partial_refund':
        const refundAmountValue = refundAmount || 0;
        if (refundAmountValue > 0) {
          await stripe.refunds.create({
            payment_intent: escrowTransaction.stripe_payment_intent_id,
            amount: Math.round(refundAmountValue * 100) // Convert to cents
          });
          logStep("Partial refund created", { refundAmount: refundAmountValue });
        }
        
        // Capture remaining amount for seller
        const remainingAmount = escrowTransaction.amount - refundAmountValue;
        if (remainingAmount > 0) {
          try {
            await stripe.paymentIntents.capture(escrowTransaction.stripe_payment_intent_id, {
              amount_to_capture: Math.round(remainingAmount * 100)
            });
            logStep("Remaining amount captured for seller", { remainingAmount });
          } catch (error) {
            logStep("Could not capture remaining amount", { error: error.message });
          }
        }
        
        resolutionData.refund_amount = refundAmountValue;
        resolutionData.seller_amount = remainingAmount;
        break;

      case 'release_seller':
        // Capture the full payment for the seller
        try {
          await stripe.paymentIntents.capture(escrowTransaction.stripe_payment_intent_id);
          logStep("Payment captured for seller");
        } catch (error) {
          logStep("Payment may already be captured", { error: error.message });
        }
        resolutionData.funds_released_at = now;
        break;

      case 'mediation':
        // Keep in disputed status but mark for human review
        finalStatus = "mediation_required";
        resolutionData.status = finalStatus;
        delete resolutionData.dispute_resolved_at; // Don't mark as resolved yet
        break;

      default:
        throw new Error("Invalid resolution type");
    }

    // Update escrow transaction
    const { error: updateError } = await supabaseClient
      .from('escrow_transactions')
      .update(resolutionData)
      .eq('id', escrowTransactionId);

    if (updateError) throw new Error(`Failed to update transaction: ${updateError.message}`);

    // Send notifications to both parties
    const notificationPromises = [
      // Notify buyer
      supabaseClient.from('notifications').insert({
        user_id: escrowTransaction.buyer_id,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: `Your dispute has been resolved: ${resolution.replace('_', ' ')}. ${resolutionNotes}`,
        related_id: escrowTransactionId
      }),
      // Notify seller
      supabaseClient.from('notifications').insert({
        user_id: escrowTransaction.seller_id,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: `The dispute for your transaction has been resolved: ${resolution.replace('_', ' ')}. ${resolutionNotes}`,
        related_id: escrowTransactionId
      })
    ];

    await Promise.all(notificationPromises);

    logStep("Dispute resolved successfully", { 
      escrowId: escrowTransactionId, 
      resolution,
      finalStatus 
    });

    return new Response(JSON.stringify({ 
      success: true,
      resolution,
      status: finalStatus,
      message: "Dispute resolved successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in resolve-dispute", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
