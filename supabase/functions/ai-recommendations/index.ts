
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

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { user_preferences, max_recommendations = 10 } = await req.json();

    console.log('Generating AI recommendations for user:', user.id);

    // Get user's profile and preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get all active listings
    const { data: listings, error: listingsError } = await supabaseClient
      .from('dog_listings')
      .select('*')
      .eq('status', 'active')
      .neq('user_id', user.id);

    if (listingsError) throw listingsError;

    // Simple AI recommendation algorithm
    const recommendations = listings?.map(listing => {
      let score = 0.5; // Base score
      let reasoning = 'General match';

      // Preference-based scoring
      if (user_preferences?.preferred_breeds?.includes(listing.breed)) {
        score += 0.3;
        reasoning += `, preferred breed (${listing.breed})`;
      }

      if (user_preferences?.location && listing.location?.includes(user_preferences.location)) {
        score += 0.2;
        reasoning += `, nearby location`;
      }

      if (user_preferences?.price_range) {
        const price = parseFloat(listing.price);
        if (price >= user_preferences.price_range.min && price <= user_preferences.price_range.max) {
          score += 0.2;
          reasoning += `, within price range`;
        }
      }

      if (user_preferences?.age_range) {
        if (listing.age >= user_preferences.age_range.min && listing.age <= user_preferences.age_range.max) {
          score += 0.1;
          reasoning += `, suitable age`;
        }
      }

      // Add some randomness for variety
      score += Math.random() * 0.1;

      return {
        listing_id: listing.id,
        listing,
        confidence_score: Math.min(score, 1.0),
        reasoning,
        recommendation_type: 'ai_match'
      };
    }) || [];

    // Sort by confidence and take top recommendations
    const topRecommendations = recommendations
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, max_recommendations);

    // Store recommendations in database
    const recommendationInserts = topRecommendations.map(rec => ({
      user_id: user.id,
      listing_id: rec.listing_id,
      recommendation_type: rec.recommendation_type,
      confidence_score: rec.confidence_score,
      reasoning: rec.reasoning,
      metadata: { algorithm_version: '1.0', preferences: user_preferences }
    }));

    const { error: insertError } = await supabaseClient
      .from('ai_recommendations')
      .insert(recommendationInserts);

    if (insertError) {
      console.error('Failed to store recommendations:', insertError);
    }

    console.log(`Generated ${topRecommendations.length} recommendations`);

    return new Response(JSON.stringify({
      recommendations: topRecommendations,
      total_count: topRecommendations.length,
      algorithm_version: '1.0'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
