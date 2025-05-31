
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  type: 'new_message' | 'listing_interest' | 'verification_update' | 'payment_confirmation';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailNotificationRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case 'new_message':
        subject = `New message from ${data.senderName}`;
        html = `
          <h2>You have a new message!</h2>
          <p><strong>From:</strong> ${data.senderName}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          <p><a href="${data.conversationLink}">View Conversation</a></p>
        `;
        break;

      case 'listing_interest':
        subject = `Someone is interested in ${data.petName}`;
        html = `
          <h2>Great news! Someone is interested in your pet.</h2>
          <p><strong>Pet:</strong> ${data.petName}</p>
          <p><strong>Interested buyer:</strong> ${data.buyerName}</p>
          <p><a href="${data.listingLink}">View Listing</a></p>
        `;
        break;

      case 'verification_update':
        subject = `Verification Status Update`;
        html = `
          <h2>Your verification status has been updated</h2>
          <p><strong>Status:</strong> ${data.status}</p>
          ${data.rejectionReason ? `<p><strong>Reason:</strong> ${data.rejectionReason}</p>` : ''}
          <p><a href="${data.profileLink}">View Profile</a></p>
        `;
        break;

      case 'payment_confirmation':
        subject = `Payment Confirmation - ${data.petName}`;
        html = `
          <h2>Payment Confirmed!</h2>
          <p>Your payment for <strong>${data.petName}</strong> has been processed.</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p>The seller will contact you soon to arrange next steps.</p>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "MY PUP <notifications@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
