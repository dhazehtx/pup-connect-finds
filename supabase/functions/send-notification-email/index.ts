
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

    // Send via SendGrid if configured. Do NOT report a fake success — if email
    // is not configured, say so explicitly so callers/logs reflect reality.
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || Deno.env.get('SENDGRID_FROM') || 'noreply@petadoptionwebservices.com';

    let emailSent = false;
    let emailError: string | null = null;

    if (sendgridKey) {
      try {
        const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to_email }] }],
            from: { email: fromEmail },
            subject,
            content: [{ type: 'text/plain', value: `${message}${action_url ? `\n\n${action_url}` : ''}` }],
          }),
        });
        emailSent = resp.ok;
        if (!resp.ok) emailError = `SendGrid responded ${resp.status}`;
      } catch (e) {
        emailError = (e as Error)?.message || 'SendGrid request failed';
      }
    } else {
      emailError = 'email_not_configured';
      console.warn('[send-notification-email] SENDGRID_API_KEY not set — email not sent (notification still recorded).');
    }

    return new Response(JSON.stringify({
      success: emailSent,
      email_sent: emailSent,
      email_error: emailError,
      notification_created: !notificationError
    }), {
      // 200 only when the email actually went out; otherwise 502 so the failure is visible.
      status: emailSent ? 200 : 502,
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
