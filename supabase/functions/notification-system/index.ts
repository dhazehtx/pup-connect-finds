
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

    const { action, notification_data } = await req.json()

    if (action === 'send_notification') {
      const { user_id, type, title, message, related_id, sender_id } = notification_data

      // Create notification in database
      const { data, error } = await supabaseClient
        .from('notifications')
        .insert({
          user_id,
          type,
          title,
          message,
          related_id,
          sender_id,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Send real-time notification via Supabase channels
      await supabaseClient
        .channel(`notifications:${user_id}`)
        .send({
          type: 'broadcast',
          event: 'new_notification',
          payload: data
        })

      return new Response(
        JSON.stringify({ success: true, notification: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'send_bulk_notifications') {
      const { user_ids, type, title, message, related_id, sender_id } = notification_data

      const notifications = user_ids.map((user_id: string) => ({
        user_id,
        type,
        title,
        message,
        related_id,
        sender_id,
        is_read: false,
        created_at: new Date().toISOString()
      }))

      const { data, error } = await supabaseClient
        .from('notifications')
        .insert(notifications)
        .select()

      if (error) throw error

      // Send real-time notifications
      for (const notification of data) {
        await supabaseClient
          .channel(`notifications:${notification.user_id}`)
          .send({
            type: 'broadcast',
            event: 'new_notification',
            payload: notification
          })
      }

      return new Response(
        JSON.stringify({ success: true, notifications: data }),
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
