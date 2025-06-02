
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, preferences } = await req.json();

    if (action === 'get_recommendations') {
      // Get user's matching preferences
      const { data: userPrefs, error: prefsError } = await supabaseClient
        .from('matching_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefsError && prefsError.code !== 'PGRST116') {
        throw prefsError;
      }

      // Get user's interaction history
      const { data: interactions, error: interactionsError } = await supabaseClient
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('interaction_type', 'view')
        .eq('target_type', 'listing')
        .order('created_at', { ascending: false })
        .limit(50);

      if (interactionsError) {
        throw interactionsError;
      }

      // Build matching query based on preferences
      let query = supabaseClient
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            location,
            verified,
            rating
          )
        `)
        .eq('status', 'active');

      if (userPrefs) {
        // Filter by preferred breeds
        if (userPrefs.preferred_breeds && userPrefs.preferred_breeds.length > 0) {
          query = query.in('breed', userPrefs.preferred_breeds);
        }

        // Filter by price range
        if (userPrefs.price_range_min) {
          query = query.gte('price', userPrefs.price_range_min);
        }
        if (userPrefs.price_range_max) {
          query = query.lte('price', userPrefs.price_range_max);
        }

        // Filter by age range (in months)
        if (userPrefs.age_range_min) {
          query = query.gte('age', userPrefs.age_range_min);
        }
        if (userPrefs.age_range_max) {
          query = query.lte('age', userPrefs.age_range_max);
        }
      }

      const { data: listings, error: listingsError } = await query.limit(20);

      if (listingsError) {
        throw listingsError;
      }

      // Score listings based on user preferences and behavior
      const scoredListings = listings.map(listing => {
        let score = 0;

        // Base score
        score += 50;

        // Breed preference match
        if (userPrefs?.preferred_breeds?.includes(listing.breed)) {
          score += 30;
        }

        // Price preference match
        if (userPrefs?.price_range_min && userPrefs?.price_range_max) {
          const priceRange = userPrefs.price_range_max - userPrefs.price_range_min;
          const priceDiff = Math.abs(listing.price - ((userPrefs.price_range_min + userPrefs.price_range_max) / 2));
          const priceScore = Math.max(0, 20 - (priceDiff / priceRange) * 20);
          score += priceScore;
        }

        // Verified seller bonus
        if (listing.profiles?.verified) {
          score += 15;
        }

        // High-rated seller bonus
        if (listing.profiles?.rating && listing.profiles.rating > 4.0) {
          score += 10;
        }

        // Recency bonus (newer listings get slight boost)
        const daysSinceCreated = (new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) {
          score += 5;
        }

        return { ...listing, match_score: Math.round(score) };
      });

      // Sort by match score
      scoredListings.sort((a, b) => b.match_score - a.match_score);

      console.log(`Generated ${scoredListings.length} recommendations for user ${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        recommendations: scoredListings,
        user_preferences: userPrefs,
        total_count: scoredListings.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'update_preferences') {
      // Update user matching preferences
      const { data: updatedPrefs, error: updateError } = await supabaseClient
        .from('matching_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return new Response(JSON.stringify({
        success: true,
        preferences: updatedPrefs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in smart-matching:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
