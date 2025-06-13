
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, recipientId, recipientName, donorEmail, description } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create donation payment session
    const session = await stripe.checkout.sessions.create({
      customer_email: donorEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Donation to ${recipientName}`,
              description: description
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/donations?success=true&recipient=${recipientName}`,
      cancel_url: `${req.headers.get("origin")}/donations`,
      metadata: {
        type: "donation",
        recipient_id: recipientId,
        recipient_name: recipientName,
        donor_email: donorEmail
      },
    });

    // Log donation attempt
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("donations").insert({
      recipient_id: recipientId,
      donor_email: donorEmail,
      amount: amount / 100, // Convert back to dollars
      stripe_session_id: session.id,
      status: "pending"
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
