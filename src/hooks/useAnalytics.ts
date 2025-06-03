
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalListings: 0,
    totalFavorites: 0,
    totalInquiries: 0,
    averagePrice: 0,
    conversionRate: 0,
    topPerformingListings: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  const fetchAnalytics = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get user's listings
      const { data: listings, error: listingsError } = await supabase
        .from('dog_listings')
        .select('*')
        .eq('user_id', userId);

      if (listingsError) throw listingsError;

      const listingIds = listings?.map(l => l.id) || [];

      // Get favorites for user's listings
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact' })
        .in('listing_id', listingIds);

      // Get conversations for user's listings
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .in('listing_id', listingIds);

      // Calculate analytics
      const totalListings = listings?.length || 0;
      const totalFavorites = favoritesCount || 0;
      const totalInquiries = conversationsCount || 0;
      const averagePrice = listings?.reduce((sum, listing) => sum + (listing.price || 0), 0) / totalListings || 0;

      // Mock additional data
      const totalViews = Math.floor(Math.random() * 2000) + 500;
      const conversionRate = totalInquiries > 0 ? (totalInquiries / totalViews) * 100 : 0;

      setAnalytics({
        totalViews,
        totalListings,
        totalFavorites,
        totalInquiries,
        averagePrice,
        conversionRate,
        topPerformingListings: listings?.slice(0, 5) || [],
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    refreshAnalytics: fetchAnalytics
  };
};
