
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  userId?: string;
  preferences?: {
    breeds?: string[];
    priceRange?: [number, number];
    location?: string;
    temperament?: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, preferences }: SearchRequest = await req.json();

    // Get user's search history and favorites for personalization
    let userContext = null;
    if (userId) {
      const { data: userHistory } = await supabase
        .from('saved_searches')
        .select('filters')
        .eq('user_id', userId)
        .limit(5);

      const { data: userFavorites } = await supabase
        .from('favorites')
        .select('listing_id, dog_listings(breed, price)')
        .eq('user_id', userId)
        .limit(10);

      userContext = { searchHistory: userHistory, favorites: userFavorites };
    }

    // Enhanced search with AI-like scoring
    let queryBuilder = supabase
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
      .eq('status', 'active');

    // Apply text search with weighted scoring
    if (query) {
      queryBuilder = queryBuilder.or(
        `dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Apply preference filters
    if (preferences?.breeds && preferences.breeds.length > 0) {
      queryBuilder = queryBuilder.in('breed', preferences.breeds);
    }

    if (preferences?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price', preferences.priceRange[0])
        .lte('price', preferences.priceRange[1]);
    }

    const { data: results, error } = await queryBuilder.limit(20);

    if (error) throw error;

    // AI-like ranking algorithm
    const rankedResults = results?.map(listing => {
      let score = 0;

      // Boost score for verified sellers
      if (listing.profiles?.verified) score += 20;

      // Boost score for highly rated sellers
      if (listing.profiles?.rating) {
        score += listing.profiles.rating * 5;
      }

      // Boost score for user's preferred breeds (if available)
      if (userContext?.favorites) {
        const favoriteBreeds = userContext.favorites
          .map(fav => fav.dog_listings?.breed)
          .filter(Boolean);
        if (favoriteBreeds.includes(listing.breed)) {
          score += 15;
        }
      }

      // Boost score for query relevance
      if (query) {
        const queryLower = query.toLowerCase();
        if (listing.dog_name.toLowerCase().includes(queryLower)) score += 25;
        if (listing.breed.toLowerCase().includes(queryLower)) score += 20;
        if (listing.description?.toLowerCase().includes(queryLower)) score += 10;
      }

      // Boost score for recent listings
      const daysSinceCreated = (new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 10;

      return { ...listing, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore) || [];

    // Generate recommendations based on user behavior
    const recommendations = [];
    if (userContext?.favorites && userContext.favorites.length > 0) {
      const favoriteBreeds = [...new Set(
        userContext.favorites
          .map(fav => fav.dog_listings?.breed)
          .filter(Boolean)
      )];

      if (favoriteBreeds.length > 0) {
        recommendations.push({
          type: 'breed_based',
          title: 'You might also like these breeds',
          breeds: favoriteBreeds,
        });
      }
    }

    return new Response(
      JSON.stringify({
        results: rankedResults,
        recommendations,
        totalCount: rankedResults.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('AI search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
