
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { user_id, phone_number, message, message_type = 'notification' } = await req.json();

    if (!user_id || !phone_number || !message) {
      throw new Error('Missing required fields: user_id, phone_number, message');
    }

    console.log(`Sending SMS to ${phone_number} for user ${user_id}`);

    // Twilio API call
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    
    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: phone_number,
        Body: message
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      throw new Error(`Twilio API error: ${twilioData.message || 'Unknown error'}`);
    }

    // Store SMS record
    const { data: smsRecord, error: dbError } = await supabaseClient
      .from('sms_notifications')
      .insert({
        user_id,
        phone_number,
        message,
        status: 'sent',
        provider: 'twilio',
        provider_message_id: twilioData.sid,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log(`SMS sent successfully: ${twilioData.sid}`);

    return new Response(JSON.stringify({
      success: true,
      message_id: twilioData.sid,
      status: twilioData.status,
      sms_record_id: smsRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sms-notifications:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
