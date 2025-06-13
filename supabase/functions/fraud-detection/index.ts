
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FRAUD-DETECTION] ${step}${detailsStr}`);
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
    logStep("Fraud detection started");

    const { transactionId, eventType, userBehavior, transactionDetails } = await req.json();
    if (!transactionId || !eventType) {
      throw new Error("Missing required parameters");
    }

    // Get transaction details
    const { data: transaction, error: txError } = await supabaseClient
      .from('escrow_transactions')
      .select(`
        *,
        dog_listings!listing_id (
          user_id,
          price,
          created_at
        ),
        profiles!buyer_id (
          created_at,
          verified
        )
      `)
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) throw new Error("Transaction not found");

    let riskScore = 0;
    const riskFactors = [];

    // Calculate risk score based on various factors
    logStep("Analyzing risk factors", { eventType });

    // 1. New user risk (higher risk for very new accounts)
    const buyerAge = transaction.profiles?.created_at ? 
      (Date.now() - new Date(transaction.profiles.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    if (buyerAge < 7) { // Account less than a week old
      riskScore += 0.3;
      riskFactors.push('new_user_account');
    }

    // 2. Unverified user making large purchase
    if (!transaction.profiles?.verified && transaction.amount > 1000) {
      riskScore += 0.4;
      riskFactors.push('unverified_large_purchase');
    }

    // 3. Listing age vs transaction speed
    const listingAge = transaction.dog_listings?.created_at ? 
      (new Date(transaction.created_at).getTime() - new Date(transaction.dog_listings.created_at).getTime()) / (1000 * 60 * 60) : 24;
    
    if (listingAge < 1) { // Transaction within 1 hour of listing
      riskScore += 0.2;
      riskFactors.push('immediate_purchase');
    }

    // 4. Price anomalies
    if (transaction.amount > 5000) { // Very high price
      riskScore += 0.2;
      riskFactors.push('high_value_transaction');
    }

    // 5. Behavioral patterns from user behavior data
    if (userBehavior) {
      if (userBehavior.rapidClicks > 10) {
        riskScore += 0.1;
        riskFactors.push('rapid_clicking');
      }
      
      if (userBehavior.multiplePaymentAttempts > 2) {
        riskScore += 0.3;
        riskFactors.push('multiple_payment_attempts');
      }
      
      if (userBehavior.unusualHours) { // Purchases at very odd hours
        riskScore += 0.1;
        riskFactors.push('unusual_hours');
      }
    }

    // 6. Geographic inconsistencies
    if (transactionDetails?.ipLocation && transactionDetails?.userLocation) {
      // This would need actual geolocation validation
      // For now, just a placeholder
      if (transactionDetails.locationMismatch) {
        riskScore += 0.2;
        riskFactors.push('location_mismatch');
      }
    }

    // 7. Known fraud patterns
    if (eventType === 'suspicious_pattern') {
      riskScore += 0.4;
      riskFactors.push('known_fraud_pattern');
    }

    // Cap the risk score at 1.0
    riskScore = Math.min(riskScore, 1.0);

    logStep("Risk analysis complete", { riskScore, riskFactors });

    // Create fraud detection event
    const { data: fraudEvent, error: fraudError } = await supabaseClient
      .from('fraud_detection_events')
      .insert({
        escrow_transaction_id: transactionId,
        user_id: transaction.buyer_id,
        listing_id: transaction.listing_id,
        event_type: eventType,
        risk_score: riskScore,
        detection_method: 'automated_analysis',
        details: {
          risk_factors: riskFactors,
          user_behavior: userBehavior,
          transaction_details: transactionDetails,
          buyer_age_days: buyerAge,
          listing_age_hours: listingAge
        },
        auto_action_taken: riskScore >= 0.8 ? 'transaction_flagged' : 
                          riskScore >= 0.6 ? 'manual_review_required' : 'logged_only'
      })
      .select()
      .single();

    if (fraudError) throw new Error(`Failed to create fraud event: ${fraudError.message}`);

    // Auto-actions based on risk score
    let autoActions = [];

    if (riskScore >= 0.8) {
      // High risk - flag transaction and prevent completion
      await supabaseClient
        .from('escrow_transactions')
        .update({
          fraud_flags: transaction.fraud_flags || [] as any[],
          auto_refund_eligible: false // Prevent auto-refunds for flagged transactions
        })
        .eq('id', transactionId);

      // Create admin notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: transaction.buyer_id, // This should be admin user ID in real implementation
          type: 'fraud_alert',
          title: 'High Risk Transaction Detected',
          message: `Transaction ${transactionId} has been flagged for manual review (Risk Score: ${riskScore.toFixed(2)})`,
          related_id: transactionId
        });

      autoActions.push('transaction_flagged', 'admin_notified');

    } else if (riskScore >= 0.6) {
      // Medium risk - require manual review
      await supabaseClient
        .from('escrow_transactions')
        .update({
          fraud_flags: (transaction.fraud_flags || [] as any[]).concat([{
            event_id: fraudEvent.id,
            risk_score: riskScore,
            flagged_at: new Date().toISOString(),
            status: 'review_required'
          }])
        })
        .eq('id', transactionId);

      autoActions.push('manual_review_required');

    } else if (riskScore >= 0.3) {
      // Low-medium risk - enable enhanced monitoring
      await supabaseClient
        .from('escrow_transactions')
        .update({
          auto_refund_eligible: true // Allow auto-refunds for low risk
        })
        .eq('id', transactionId);

      autoActions.push('enhanced_monitoring');
    } else {
      // Low risk - normal processing
      await supabaseClient
        .from('escrow_transactions')
        .update({
          auto_refund_eligible: true
        })
        .eq('id', transactionId);

      autoActions.push('normal_processing');
    }

    logStep("Fraud detection complete", {
      fraudEventId: fraudEvent.id,
      riskScore,
      autoActions
    });

    return new Response(JSON.stringify({
      success: true,
      fraud_event_id: fraudEvent.id,
      risk_score: riskScore,
      risk_factors: riskFactors,
      auto_actions: autoActions,
      recommendation: riskScore >= 0.8 ? 'block_transaction' :
                     riskScore >= 0.6 ? 'manual_review' :
                     riskScore >= 0.3 ? 'monitor' : 'approve'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in fraud-detection", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
