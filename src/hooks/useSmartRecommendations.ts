
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RecommendationData {
  id: string;
  listing_id: string;
  confidence_score: number;
  recommendation_type: 'behavioral' | 'collaborative' | 'content_based' | 'trending' | 'location_based';
  reasoning: string[];
  listing: any;
  created_at: string;
}

interface UserBehavior {
  viewed_listings: string[];
  favorited_listings: string[];
  search_queries: string[];
  preferred_breeds: string[];
  price_range: [number, number];
  location_preferences: string[];
}

export const useSmartRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [trendingListings, setTrendingListings] = useState<any[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateRecommendations = useCallback(async (maxRecommendations = 10) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          user_preferences: userBehavior,
          max_recommendations: maxRecommendations
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Recommendations Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, userBehavior, toast]);

  const trackUserInteraction = useCallback(async (interactionType: string, targetId: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          interaction_type: interactionType,
          target_type: 'listing',
          target_id: targetId,
          metadata: metadata || {},
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        });

      // Update user behavior data
      await updateUserBehavior(interactionType, targetId);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user]);

  const updateUserBehavior = async (interactionType: string, targetId: string) => {
    // This would typically be handled by a background job
    // For now, we'll update locally and periodically sync
    setUserBehavior(prev => {
      if (!prev) return prev;

      switch (interactionType) {
        case 'view':
          return {
            ...prev,
            viewed_listings: [...new Set([...prev.viewed_listings, targetId])]
          };
        case 'favorite':
          return {
            ...prev,
            favorited_listings: [...new Set([...prev.favorited_listings, targetId])]
          };
        default:
          return prev;
      }
    });
  };

  const loadUserBehavior = useCallback(async () => {
    if (!user) return;

    try {
      // Load user interactions and preferences
      const [interactionsResponse, preferencesResponse] = await Promise.all([
        supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      const interactions = interactionsResponse.data || [];
      const preferences = preferencesResponse.data?.matching_criteria || {};

      // Process interactions into behavior data
      const behavior: UserBehavior = {
        viewed_listings: interactions
          .filter(i => i.interaction_type === 'view')
          .map(i => i.target_id)
          .filter(Boolean),
        favorited_listings: interactions
          .filter(i => i.interaction_type === 'favorite')
          .map(i => i.target_id)
          .filter(Boolean),
        search_queries: interactions
          .filter(i => i.interaction_type === 'search')
          .map(i => i.metadata?.query)
          .filter(Boolean),
        preferred_breeds: preferences.preferred_breeds || [],
        price_range: preferences.price_range || [0, 5000],
        location_preferences: preferences.locations || []
      };

      setUserBehavior(behavior);
    } catch (error) {
      console.error('Error loading user behavior:', error);
    }
  }, [user]);

  const loadTrendingListings = useCallback(async () => {
    try {
      // Calculate trending based on recent interactions
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          target_id,
          dog_listings (*)
        `)
        .eq('target_type', 'listing')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('dog_listings', 'is', null);

      if (error) throw error;

      // Count interactions per listing
      const interactionCounts: Record<string, number> = {};
      data.forEach(interaction => {
        if (interaction.target_id) {
          interactionCounts[interaction.target_id] = 
            (interactionCounts[interaction.target_id] || 0) + 1;
        }
      });

      // Get top trending listings
      const trending = Object.entries(interactionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([listingId, count]) => {
          const listing = data.find(d => d.target_id === listingId)?.dog_listings;
          return listing ? { ...listing, interaction_count: count } : null;
        })
        .filter(Boolean);

      setTrendingListings(trending);
    } catch (error) {
      console.error('Error loading trending listings:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadUserBehavior();
      loadTrendingListings();
    }
  }, [user, loadUserBehavior, loadTrendingListings]);

  useEffect(() => {
    if (userBehavior && user) {
      generateRecommendations();
    }
  }, [userBehavior, user, generateRecommendations]);

  return {
    recommendations,
    trendingListings,
    userBehavior,
    loading,
    generateRecommendations,
    trackUserInteraction,
    loadUserBehavior,
    loadTrendingListings
  };
};
