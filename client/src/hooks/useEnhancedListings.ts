
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiRequest } from '@/lib/api';
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
          const favCountData = await apiRequest(`/api/favorites/count/${listing.id}`).catch(() => ({ count: 0 }));
          const favoritesCount = favCountData?.count ?? 0;

          let conversationsCount = 0;
          try {
            const convData = await apiRequest(`/messaging/conversations?listing_id=${listing.id}`);
            conversationsCount = Array.isArray(convData) ? convData.length : 0;
          } catch {}

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
