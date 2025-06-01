
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-DISPUTE] ${step}${detailsStr}`);
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
    logStep("Dispute creation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { escrowTransactionId, reason } = await req.json();
    if (!escrowTransactionId || !reason) {
      throw new Error("Escrow transaction ID and reason are required");
    }

    // Get escrow transaction
    const { data: escrowTransaction, error: escrowError } = await supabaseClient
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowTransactionId)
      .single();

    if (escrowError || !escrowTransaction) throw new Error("Escrow transaction not found");

    // Verify user is authorized to create dispute
    const isParticipant = escrowTransaction.buyer_id === user.id || escrowTransaction.seller_id === user.id;
    if (!isParticipant) {
      throw new Error("Not authorized to create dispute for this transaction");
    }

    // Check if transaction is eligible for dispute
    if (escrowTransaction.status === "completed") {
      throw new Error("Cannot dispute a completed transaction");
    }

    if (escrowTransaction.status === "disputed") {
      throw new Error("Transaction is already under dispute");
    }

    // Update escrow transaction with dispute
    const { error: updateError } = await supabaseClient
      .from('escrow_transactions')
      .update({
        status: "disputed",
        dispute_reason: reason,
        dispute_created_at: new Date().toISOString()
      })
      .eq('id', escrowTransactionId);

    if (updateError) throw new Error(`Failed to create dispute: ${updateError.message}`);

    // Send notification to other party and admin
    const otherPartyId = escrowTransaction.buyer_id === user.id 
      ? escrowTransaction.seller_id 
      : escrowTransaction.buyer_id;

    await supabaseClient.from('notifications').insert([
      {
        user_id: otherPartyId,
        type: 'dispute_created',
        title: 'Transaction Dispute Created',
        message: `A dispute has been created for your transaction. Reason: ${reason}`,
        related_id: escrowTransactionId,
        sender_id: user.id
      }
    ]);

    logStep("Dispute created successfully", { escrowId: escrowTransactionId, reason });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Dispute created successfully. An administrator will review your case."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-dispute", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
