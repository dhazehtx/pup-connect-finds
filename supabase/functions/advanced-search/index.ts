
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

    const { 
      query, 
      breeds, 
      price_range, 
      age_range, 
      location, 
      verified_sellers_only,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 20,
      offset = 0
    } = await req.json()

    let searchQuery = supabaseClient
      .from('dog_listings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          username,
          location,
          verified,
          rating,
          total_reviews
        )
      `)
      .eq('status', 'active')

    // Text search across multiple fields
    if (query) {
      searchQuery = searchQuery.or(
        `dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Breed filter
    if (breeds && breeds.length > 0) {
      searchQuery = searchQuery.in('breed', breeds)
    }

    // Price range filter
    if (price_range) {
      if (price_range.min !== undefined) {
        searchQuery = searchQuery.gte('price', price_range.min)
      }
      if (price_range.max !== undefined) {
        searchQuery = searchQuery.lte('price', price_range.max)
      }
    }

    // Age range filter
    if (age_range) {
      if (age_range.min !== undefined) {
        searchQuery = searchQuery.gte('age', age_range.min)
      }
      if (age_range.max !== undefined) {
        searchQuery = searchQuery.lte('age', age_range.max)
      }
    }

    // Location filter
    if (location) {
      searchQuery = searchQuery.ilike('location', `%${location}%`)
    }

    // Sorting
    searchQuery = searchQuery.order(sort_by, { ascending: sort_order === 'asc' })

    // Pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1)

    const { data: listings, error } = await searchQuery

    if (error) throw error

    // Filter for verified sellers if requested
    let filteredListings = listings || []
    if (verified_sellers_only) {
      filteredListings = filteredListings.filter(listing => 
        listing.profiles?.verified === true
      )
    }

    // Get total count for pagination
    const { count } = await supabaseClient
      .from('dog_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    return new Response(
      JSON.stringify({
        listings: filteredListings,
        total_count: count,
        has_more: (offset + limit) < (count || 0)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
