
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEnhancedListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            avatar_url,
            verified
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance listings with analytics data
      const enhancedListings = await Promise.all(
        (data || []).map(async (listing) => {
          // Get favorites count
          const { count: favoritesCount } = await supabase
            .from('favorites')
            .select('*', { count: 'exact' })
            .eq('listing_id', listing.id);

          // Get conversations count
          const { count: conversationsCount } = await supabase
            .from('conversations')
            .select('*', { count: 'exact' })
            .eq('listing_id', listing.id);

          return {
            ...listing,
            favorites_count: favoritesCount || 0,
            conversations_count: conversationsCount || 0,
            views: Math.floor(Math.random() * 500) + 50, // Mock data
            engagement_rate: Math.random() * 10 + 2
          };
        })
      );

      setListings(enhancedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    listings,
    loading,
    refreshListings: fetchUserListings
  };
};
