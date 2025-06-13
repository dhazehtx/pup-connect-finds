
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SmartRecommendation {
  id: string;
  listing_id: string;
  score: number;
  reason: string;
  dog_name: string;
  breed: string;
  price: number;
  image_url?: string;
  location: string;
}

interface RecommendationFilters {
  breed?: string;
  priceRange?: [number, number];
  location?: string;
  age?: string;
}

interface UserBehavior {
  preferred_breeds: string[];
  price_range: [number, number];
  location_preferences: string[];
  interaction_patterns: any[];
}

export const useSmartRecommendations = () => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [trendingListings, setTrendingListings] = useState<SmartRecommendation[]>([]);
  const { user } = useAuth();

  const generateRecommendations = useCallback(async (
    filters: RecommendationFilters = {},
    limit: number = 10
  ) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build simplified recommendation query
      let query = supabase
        .from('dog_listings')
        .select(`
          id,
          dog_name,
          breed,
          price,
          image_url,
          location,
          age,
          created_at
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.breed) {
        query = query.ilike('breed', `%${filters.breed}%`);
      }

      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange[0])
                    .lte('price', filters.priceRange[1]);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.age) {
        query = query.eq('age', filters.age);
      }

      const { data: listings, error: listingsError } = await query.limit(limit * 2);

      if (listingsError) throw listingsError;

      // Generate simple recommendations with scoring
      const scoredRecommendations = (listings || []).map(listing => {
        let score = Math.random() * 50 + 50; // Base score between 50-100
        let reasons: string[] = ['Great match for you'];

        // Recency bonus
        const daysOld = Math.floor(
          (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysOld <= 7) {
          score += 10;
          reasons.push('Recently listed');
        }

        return {
          id: listing.id,
          listing_id: listing.id,
          score,
          reason: reasons.join(', '),
          dog_name: listing.dog_name,
          breed: listing.breed,
          price: listing.price,
          image_url: listing.image_url,
          location: listing.location || 'Location not specified'
        };
      });

      // Sort by score and take top recommendations
      const topRecommendations = scoredRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setRecommendations(topRecommendations);

      // Set trending listings (mock data for now)
      setTrendingListings(topRecommendations.slice(0, 5));

    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const trackRecommendationClick = useCallback(async (recommendationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'recommendation_clicked',
          event_data: { recommendation_id: recommendationId },
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          page_url: window.location.pathname
        });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  }, [user]);

  const trackUserInteraction = useCallback(async (type: string, listingId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: type,
          event_data: { listing_id: listingId },
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          page_url: window.location.pathname
        });
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }, [user]);

  const saveRecommendationFeedback = useCallback(async (
    recommendationId: string, 
    feedback: 'helpful' | 'not_helpful' | 'interested'
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'recommendation_feedback',
          metadata: { 
            recommendation_id: recommendationId, 
            feedback 
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving recommendation feedback:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      generateRecommendations();
      // Initialize user behavior with mock data
      setUserBehavior({
        preferred_breeds: ['Golden Retriever', 'Labrador'],
        price_range: [500, 2000],
        location_preferences: ['San Francisco', 'Bay Area'],
        interaction_patterns: []
      });
    }
  }, [user, generateRecommendations]);

  return {
    recommendations,
    loading,
    error,
    userBehavior,
    trendingListings,
    generateRecommendations,
    trackRecommendationClick,
    trackUserInteraction,
    saveRecommendationFeedback
  };
};
