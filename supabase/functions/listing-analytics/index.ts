
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

    const { listingId, action } = await req.json()

    if (action === 'track_view') {
      // Track listing view
      await supabaseClient
        .from('listing_views')
        .insert({
          listing_id: listingId,
          viewer_ip: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent'),
          viewed_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'get_analytics') {
      // Get analytics for a listing
      const { data: views } = await supabaseClient
        .from('listing_views')
        .select('*')
        .eq('listing_id', listingId)

      const { data: favorites } = await supabaseClient
        .from('favorites')
        .select('*')
        .eq('listing_id', listingId)

      const { data: conversations } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)

      const analytics = {
        total_views: views?.length || 0,
        unique_views: new Set(views?.map(v => v.viewer_ip)).size || 0,
        total_favorites: favorites?.length || 0,
        total_inquiries: conversations?.length || 0,
        views_by_day: views?.reduce((acc: any, view) => {
          const date = new Date(view.viewed_at).toDateString()
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {}) || {}
      }

      return new Response(
        JSON.stringify(analytics),
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
