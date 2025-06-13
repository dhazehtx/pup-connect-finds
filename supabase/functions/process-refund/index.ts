
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
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
    logStep("Refund processing started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { refundRequestId, adminApproval = false } = await req.json();
    if (!refundRequestId) {
      throw new Error("Missing refund request ID");
    }

    logStep("Processing refund request", { refundRequestId, adminApproval });

    // Get refund request details
    const { data: refundRequest, error: refundError } = await supabaseClient
      .from('refund_requests')
      .select(`
        *,
        escrow_transactions!inner (
          stripe_payment_intent_id,
          amount,
          buyer_id,
          seller_id,
          status
        )
      `)
      .eq('id', refundRequestId)
      .single();

    if (refundError || !refundRequest) throw new Error("Refund request not found");

    const escrowTransaction = refundRequest.escrow_transactions;
    if (!escrowTransaction) throw new Error("Associated transaction not found");

    // Verify user has permission to process this refund
    const isUserInvolved = escrowTransaction.buyer_id === user.id || escrowTransaction.seller_id === user.id;
    const isAdmin = user.email === 'admin@example.com'; // You can implement proper admin role checking

    if (!isUserInvolved && !isAdmin) {
      throw new Error("Unauthorized to process this refund");
    }

    // Check if refund is already processed
    if (refundRequest.status === 'processed') {
      throw new Error("Refund already processed");
    }

    // For admin approvals, check if user is admin
    if (adminApproval && !isAdmin) {
      throw new Error("Only admins can approve refunds");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    let stripeRefund;

    // Process refund with Stripe
    try {
      // For full refunds only (no partial refunds as per requirements)
      stripeRefund = await stripe.refunds.create({
        payment_intent: escrowTransaction.stripe_payment_intent_id,
        amount: Math.round(refundRequest.refund_amount * 100), // Convert to cents
        reason: refundRequest.refund_type === 'fraud' ? 'fraudulent' : 'requested_by_customer',
        metadata: {
          refund_request_id: refundRequestId,
          escrow_transaction_id: refundRequest.escrow_transaction_id,
          refund_type: refundRequest.refund_type
        }
      });

      logStep("Stripe refund created", { refundId: stripeRefund.id, amount: stripeRefund.amount });
    } catch (stripeError: any) {
      logStep("Stripe refund failed", { error: stripeError.message });
      throw new Error(`Refund processing failed: ${stripeError.message}`);
    }

    const now = new Date().toISOString();

    // Update refund request
    const { error: updateRefundError } = await supabaseClient
      .from('refund_requests')
      .update({
        status: 'processed',
        stripe_refund_id: stripeRefund.id,
        processed_by: user.id,
        processed_at: now,
        admin_notes: adminApproval ? 'Admin approved refund' : null,
        updated_at: now
      })
      .eq('id', refundRequestId);

    if (updateRefundError) throw new Error(`Failed to update refund request: ${updateRefundError.message}`);

    // Update escrow transaction
    const { error: updateEscrowError } = await supabaseClient
      .from('escrow_transactions')
      .update({
        status: 'refunded',
        refund_amount: refundRequest.refund_amount,
        refund_processed_at: now,
        refund_stripe_id: stripeRefund.id,
        dispute_resolution: adminApproval ? 'admin_approved' : 'automatic_refund',
        dispute_resolution_notes: refundRequest.refund_reason,
        updated_at: now
      })
      .eq('id', refundRequest.escrow_transaction_id);

    if (updateEscrowError) throw new Error(`Failed to update escrow transaction: ${updateEscrowError.message}`);

    // Send notifications to both parties
    const notificationPromises = [
      // Notify buyer
      supabaseClient.from('notifications').insert({
        user_id: escrowTransaction.buyer_id,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of $${refundRequest.refund_amount} has been processed and will appear in your account within 5-10 business days.`,
        related_id: refundRequestId
      }),
      // Notify seller
      supabaseClient.from('notifications').insert({
        user_id: escrowTransaction.seller_id,
        type: 'refund_processed',
        title: 'Transaction Refunded',
        message: `A refund of $${refundRequest.refund_amount} has been processed for your transaction.`,
        related_id: refundRequestId
      })
    ];

    await Promise.all(notificationPromises);

    logStep("Refund processed successfully", {
      refundRequestId,
      stripeRefundId: stripeRefund.id,
      amount: refundRequest.refund_amount
    });

    return new Response(JSON.stringify({
      success: true,
      refund_id: stripeRefund.id,
      amount: refundRequest.refund_amount,
      message: "Refund processed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-refund", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
