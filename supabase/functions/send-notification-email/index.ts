
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      to_email, 
      subject, 
      message, 
      user_id, 
      notification_type = 'system',
      action_url,
      metadata = {}
    } = await req.json();

    console.log('Sending notification email:', { to_email, subject, notification_type });

    // Create notification in database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        type: notification_type,
        title: subject,
        message,
        action_url,
        metadata
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    // For now, we'll just log the email (in production, integrate with email service)
    console.log('Email notification:', {
      to: to_email,
      subject,
      message,
      action_url
    });

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // Example with mock response:
    const emailResponse = {
      id: 'mock-email-id',
      status: 'sent',
      to: to_email,
      subject
    };

    return new Response(JSON.stringify({ 
      success: true, 
      email_response: emailResponse,
      notification_created: !notificationError
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-notification-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
