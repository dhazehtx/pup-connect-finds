
import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export const useListingAnalytics = () => {
  const [loading, setLoading] = useState(false);

  const getListingAnalytics = async (listingId: string) => {
    setLoading(true);
    try {
      const { data: listing } = await supabase
        .from('dog_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      const favCountData = await apiRequest(`/api/favorites/count/${listingId}`);
      const favoritesCount = favCountData?.count ?? 0;

      let inquiriesCount = 0;
      try {
        const convData = await apiRequest(`/messaging/conversations?listing_id=${listingId}`);
        inquiriesCount = Array.isArray(convData) ? convData.length : 0;
      } catch {}

      // Generate mock analytics data
      const analytics = {
        listing_id: listingId,
        views: Math.floor(Math.random() * 500) + 100,
        favorites: favoritesCount || 0,
        inquiries: inquiriesCount || 0,
        conversionRate: ((inquiriesCount || 0) / (Math.floor(Math.random() * 500) + 100)) * 100,
        viewsByDay: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          views: Math.floor(Math.random() * 50) + 10
        })),
        avgTimeOnListing: Math.floor(Math.random() * 120) + 30,
        topReferrers: ['Google Search', 'Direct Traffic', 'Social Media', 'Email Campaign']
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching listing analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceMetrics = async (userId: string) => {
    try {
      // Get user's listings
      const { data: listings } = await supabase
        .from('dog_listings')
        .select('id, dog_name, price, created_at')
        .eq('user_id', userId);

      if (!listings) return [];

      // Get analytics for each listing
      const listingMetrics = await Promise.all(
        listings.map(async (listing) => {
          const analytics = await getListingAnalytics(listing.id);
          return {
            ...listing,
            ...analytics
          };
        })
      );

      return listingMetrics;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  };

  const bulkUpdateListings = async (params: {
    listingIds: string[];
    operation: 'activate' | 'deactivate' | 'delete';
  }) => {
    setLoading(true);
    try {
      const { listingIds, operation } = params;

      if (operation === 'delete') {
        // Delete listings
        const { error } = await supabase
          .from('dog_listings')
          .delete()
          .in('id', listingIds);
        
        if (error) throw error;
      } else {
        // Update status
        const status = operation === 'activate' ? 'active' : 'inactive';
        const { error } = await supabase
          .from('dog_listings')
          .update({ status })
          .in('id', listingIds);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    getListingAnalytics,
    getPerformanceMetrics,
    bulkUpdateListings,
    loading
  };
};
