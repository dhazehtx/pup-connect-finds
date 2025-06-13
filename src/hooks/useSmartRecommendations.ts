
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
  size?: string;
}

export const useSmartRecommendations = () => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Get user preferences and interaction history
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get user's location for proximity-based recommendations
      const { data: profile } = await supabase
        .from('profiles')
        .select('location_preferences')
        .eq('id', user.id)
        .single();

      // Build recommendation query
      let query = supabase
        .from('dog_listings')
        .select(`
          id,
          dog_name,
          breed,
          price,
          images,
          location,
          age,
          size,
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

      if (filters.size) {
        query = query.eq('size', filters.size);
      }

      const { data: listings, error: listingsError } = await query.limit(limit * 2);

      if (listingsError) throw listingsError;

      // Calculate recommendation scores
      const scoredRecommendations = (listings || []).map(listing => {
        let score = 0;
        let reasons: string[] = [];

        // Preference-based scoring
        if (preferences) {
          const prefs = typeof preferences.preferences === 'string' 
            ? JSON.parse(preferences.preferences) 
            : preferences.preferences || {};

          if (prefs.preferred_breeds?.includes(listing.breed)) {
            score += 30;
            reasons.push('Matches your preferred breed');
          }

          if (prefs.price_range && 
              listing.price >= prefs.price_range[0] && 
              listing.price <= prefs.price_range[1]) {
            score += 20;
            reasons.push('Within your price range');
          }

          if (prefs.preferred_size === listing.size) {
            score += 15;
            reasons.push('Matches your preferred size');
          }
        }

        // Interaction-based scoring
        if (interactions && interactions.length > 0) {
          const viewedBreeds = interactions
            .filter(i => i.interaction_type === 'listing_view')
            .map(i => i.metadata?.breed)
            .filter(Boolean);

          if (viewedBreeds.includes(listing.breed)) {
            score += 10;
            reasons.push('Similar to dogs you\'ve viewed');
          }

          const favoriteBreeds = interactions
            .filter(i => i.interaction_type === 'favorite_added')
            .map(i => i.metadata?.breed)
            .filter(Boolean);

          if (favoriteBreeds.includes(listing.breed)) {
            score += 25;
            reasons.push('Similar to your favorites');
          }
        }

        // Location proximity scoring
        if (profile?.location_preferences) {
          const locPrefs = typeof profile.location_preferences === 'string'
            ? JSON.parse(profile.location_preferences)
            : profile.location_preferences || {};

          if (locPrefs.preferred_locations?.some((loc: string) => 
              listing.location.toLowerCase().includes(loc.toLowerCase()))) {
            score += 15;
            reasons.push('Near your preferred location');
          }
        }

        // Recency bonus
        const daysOld = Math.floor(
          (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysOld <= 7) {
          score += 5;
          reasons.push('Recently listed');
        }

        return {
          id: listing.id,
          listing_id: listing.id,
          score,
          reason: reasons.join(', ') || 'Great match for you',
          dog_name: listing.dog_name,
          breed: listing.breed,
          price: listing.price,
          image_url: Array.isArray(listing.images) ? listing.images[0] : listing.images,
          location: listing.location
        };
      });

      // Sort by score and take top recommendations
      const topRecommendations = scoredRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setRecommendations(topRecommendations);

      // Track recommendation generation for analytics
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'recommendation_generated',
          event_data: {
            filters,
            count: topRecommendations.length,
            avg_score: topRecommendations.reduce((sum, r) => sum + r.score, 0) / topRecommendations.length
          },
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          page_url: window.location.pathname
        });

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

  const saveRecommendationFeedback = useCallback(async (
    recommendationId: string, 
    feedback: 'helpful' | 'not_helpful' | 'interested'
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: user.id,
          recommendation_id: recommendationId,
          feedback,
          created_at: new Date().toISOString()
        });

      await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'recommendation_feedback',
          event_data: { recommendation_id: recommendationId, feedback },
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          page_url: window.location.pathname
        });
    } catch (error) {
      console.error('Error saving recommendation feedback:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, generateRecommendations]);

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    trackRecommendationClick,
    saveRecommendationFeedback
  };
};
