
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, user_id, verification_data } = await req.json()

    if (action === 'submit_verification') {
      const { 
        business_license,
        id_document,
        address_proof,
        contact_verification,
        experience_details
      } = verification_data

      // Store verification request
      const { data, error } = await supabaseClient
        .from('verification_requests')
        .insert({
          user_id,
          business_license,
          id_document,
          address_proof,
          contact_verification,
          experience_details,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Notify admins about new verification request
      const { data: admins } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin')

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'verification_request',
          title: 'New Verification Request',
          message: `User ${user_id} has submitted a verification request`,
          related_id: data.id,
          sender_id: user_id,
          is_read: false,
          created_at: new Date().toISOString()
        }))

        await supabaseClient
          .from('notifications')
          .insert(notifications)
      }

      return new Response(
        JSON.stringify({ success: true, request: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'approve_verification') {
      // Update verification request status
      await supabaseClient
        .from('verification_requests')
        .update({ 
          status: 'approved', 
          reviewed_at: new Date().toISOString(),
          reviewer_id: user_id
        })
        .eq('id', verification_data.request_id)

      // Update user profile to verified
      const { data: request } = await supabaseClient
        .from('verification_requests')
        .select('user_id')
        .eq('id', verification_data.request_id)
        .single()

      if (request) {
        await supabaseClient
          .from('profiles')
          .update({ verified: true })
          .eq('id', request.user_id)

        // Send notification to user
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'verification_approved',
            title: 'Verification Approved!',
            message: 'Congratulations! Your account has been verified.',
            related_id: verification_data.request_id,
            sender_id: user_id,
            is_read: false,
            created_at: new Date().toISOString()
          })
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
