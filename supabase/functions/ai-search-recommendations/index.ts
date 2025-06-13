
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
  filters?: {
    breeds?: string[];
    priceRange?: [number, number];
    ageRange?: [number, number];
    location?: string;
    radius?: number;
    verifiedOnly?: boolean;
    availableOnly?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, preferences, filters }: SearchRequest = await req.json();

    console.log('AI Search Request:', { query, userId, preferences, filters });

    // Get user's search history and favorites for personalization
    let userContext = null;
    if (userId) {
      const [userHistoryResponse, userFavoritesResponse, userInteractionsResponse] = await Promise.all([
        supabase
          .from('saved_searches')
          .select('filters')
          .eq('user_id', userId)
          .limit(5),
        supabase
          .from('favorites')
          .select('listing_id, dog_listings(breed, price)')
          .eq('user_id', userId)
          .limit(10),
        supabase
          .from('user_interactions')
          .select('target_id, metadata')
          .eq('user_id', userId)
          .eq('interaction_type', 'view')
          .limit(20)
      ]);

      userContext = { 
        searchHistory: userHistoryResponse.data || [],
        favorites: userFavoritesResponse.data || [],
        viewHistory: userInteractionsResponse.data || []
      };
    }

    // Build the main query
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
          total_reviews,
          avatar_url
        )
      `)
      .eq('status', 'active');

    // Apply text search with multiple fields
    if (query) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      const searchConditions = searchTerms.map(term => 
        `dog_name.ilike.%${term}%,breed.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`
      ).join(',');
      
      if (searchConditions) {
        queryBuilder = queryBuilder.or(searchConditions);
      }
    }

    // Apply filters
    if (filters?.breeds && filters.breeds.length > 0) {
      queryBuilder = queryBuilder.in('breed', filters.breeds);
    }

    if (filters?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);
    }

    if (filters?.ageRange) {
      queryBuilder = queryBuilder
        .gte('age', filters.ageRange[0])
        .lte('age', filters.ageRange[1]);
    }

    if (filters?.location) {
      queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const { data: results, error, count } = await queryBuilder
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    // AI-powered ranking algorithm
    const rankedResults = results?.map(listing => {
      let score = 0.5; // Base relevance score
      const reasons: string[] = [];

      // Text relevance scoring
      if (query) {
        const queryLower = query.toLowerCase();
        const searchableText = [
          listing.dog_name,
          listing.breed,
          listing.description,
          listing.location
        ].join(' ').toLowerCase();

        const queryTerms = queryLower.split(' ').filter(term => term.length > 2);
        const matchCount = queryTerms.filter(term => searchableText.includes(term)).length;
        const relevanceBoost = (matchCount / queryTerms.length) * 0.3;
        score += relevanceBoost;

        if (listing.dog_name.toLowerCase().includes(queryLower)) {
          score += 0.25;
          reasons.push('Name matches search');
        }
        if (listing.breed.toLowerCase().includes(queryLower)) {
          score += 0.2;
          reasons.push('Breed matches search');
        }
        if (listing.description?.toLowerCase().includes(queryLower)) {
          score += 0.1;
          reasons.push('Description matches search');
        }
      }

      // User personalization scoring
      if (userContext) {
        // Boost based on user's favorite breeds
        const favoriteBreeds = userContext.favorites
          .map(fav => fav.dog_listings?.breed)
          .filter(Boolean);
        if (favoriteBreeds.includes(listing.breed)) {
          score += 0.25;
          reasons.push('Matches your preferred breeds');
        }

        // Boost based on viewing history
        const viewedBreeds = userContext.viewHistory
          .map(view => view.metadata?.breed)
          .filter(Boolean);
        if (viewedBreeds.includes(listing.breed)) {
          score += 0.15;
          reasons.push('Similar to dogs you\'ve viewed');
        }

        // Price preference alignment
        const avgFavoritePrice = userContext.favorites
          .map(fav => fav.dog_listings?.price)
          .filter(Boolean)
          .reduce((sum, price, _, arr) => sum + price / arr.length, 0);
        
        if (avgFavoritePrice && Math.abs(listing.price - avgFavoritePrice) < 500) {
          score += 0.1;
          reasons.push('Within your typical price range');
        }
      }

      // Quality indicators
      if (listing.profiles?.verified) {
        score += 0.2;
        reasons.push('Verified seller');
      }

      if (listing.profiles?.rating && listing.profiles.rating > 4.0) {
        score += 0.15;
        reasons.push('Highly rated seller');
      }

      if (listing.profiles?.total_reviews && listing.profiles.total_reviews > 10) {
        score += 0.1;
        reasons.push('Experienced seller');
      }

      // Freshness boost for recent listings
      const daysSinceCreated = (new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += 0.1;
        reasons.push('Recently listed');
      }

      // Age preference (younger puppies often preferred)
      if (listing.age <= 12) {
        score += 0.1;
        reasons.push('Young puppy');
      }

      // Add some controlled randomness for variety
      score += Math.random() * 0.05;

      return {
        listing,
        relevance_score: Math.min(score, 1.0),
        reasons: reasons.slice(0, 3), // Limit to top 3 reasons
        confidence: Math.min(score * 100, 100)
      };
    }) || [];

    // Sort by relevance score
    const sortedResults = rankedResults.sort((a, b) => b.relevance_score - a.relevance_score);

    // Generate smart recommendations
    const recommendations = [];
    if (userContext?.favorites && userContext.favorites.length > 0) {
      const favoriteBreeds = [...new Set(
        userContext.favorites
          .map(fav => fav.dog_listings?.breed)
          .filter(Boolean)
      )];

      if (favoriteBreeds.length > 0) {
        recommendations.push({
          type: 'breed_affinity',
          title: 'Based on your favorites',
          description: `You seem to love ${favoriteBreeds.slice(0, 2).join(' and ')} breeds`,
          breeds: favoriteBreeds,
        });
      }
    }

    // Location-based recommendations
    if (query && query.toLowerCase().includes('near')) {
      recommendations.push({
        type: 'location_expansion',
        title: 'Expand your search area',
        description: 'Consider increasing your search radius to find more matches',
      });
    }

    // Price optimization recommendations
    const avgPrice = sortedResults.reduce((sum, item) => sum + item.listing.price, 0) / sortedResults.length;
    if (avgPrice > 3000) {
      recommendations.push({
        type: 'price_optimization',
        title: 'Budget-friendly options',
        description: 'Consider expanding your budget range or looking at different breeds',
      });
    }

    console.log(`Processed ${sortedResults.length} results with ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({
        results: sortedResults,
        recommendations,
        totalCount: count || sortedResults.length,
        searchMeta: {
          query,
          appliedFilters: filters,
          userPersonalization: !!userContext,
          algorithmVersion: '2.0'
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('AI search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        results: [],
        recommendations: [],
        totalCount: 0
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
