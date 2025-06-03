
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListingAnalytics {
  listingId: string;
  views: number;
  favorites: number;
  inquiries: number;
  conversionRate: number;
  avgTimeOnListing: number;
  topReferrers: string[];
  viewsByDay: { date: string; views: number }[];
}

interface BulkListingOperation {
  listingIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update_price';
  data?: any;
}

export const useListingAnalytics = () => {
  const [analytics, setAnalytics] = useState<ListingAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const trackListingView = async (listingId: string, userId?: string, sessionId?: string) => {
    try {
      await supabase.from('user_interactions').insert({
        user_id: userId,
        target_id: listingId,
        target_type: 'listing',
        interaction_type: 'view',
        session_id: sessionId,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to track listing view:', error);
    }
  };

  const trackListingInquiry = async (listingId: string, userId: string, inquiryType: string) => {
    try {
      await supabase.from('user_interactions').insert({
        user_id: userId,
        target_id: listingId,
        target_type: 'listing',
        interaction_type: 'inquiry',
        metadata: { 
          inquiry_type: inquiryType,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track listing inquiry:', error);
    }
  };

  const getListingAnalytics = async (listingId: string): Promise<ListingAnalytics | null> => {
    try {
      setLoading(true);
      
      // Get views
      const { data: viewsData } = await supabase
        .from('user_interactions')
        .select('created_at')
        .eq('target_id', listingId)
        .eq('interaction_type', 'view');

      // Get favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('id')
        .eq('listing_id', listingId);

      // Get inquiries
      const { data: inquiriesData } = await supabase
        .from('user_interactions')
        .select('created_at')
        .eq('target_id', listingId)
        .eq('interaction_type', 'inquiry');

      const views = viewsData?.length || 0;
      const favorites = favoritesData?.length || 0;
      const inquiries = inquiriesData?.length || 0;

      // Calculate views by day for the last 30 days
      const viewsByDay = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayViews = viewsData?.filter(view => 
          view.created_at.startsWith(dateStr)
        ).length || 0;
        
        viewsByDay.push({ date: dateStr, views: dayViews });
      }

      return {
        listingId,
        views,
        favorites,
        inquiries,
        conversionRate: views > 0 ? (inquiries / views) * 100 : 0,
        avgTimeOnListing: 45, // Placeholder - would need session tracking
        topReferrers: ['Direct', 'Search', 'Social'], // Placeholder
        viewsByDay
      };
    } catch (error) {
      console.error('Failed to get listing analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateListings = async (operation: BulkListingOperation) => {
    try {
      setLoading(true);
      
      switch (operation.operation) {
        case 'activate':
          await supabase
            .from('dog_listings')
            .update({ status: 'active' })
            .in('id', operation.listingIds);
          break;
          
        case 'deactivate':
          await supabase
            .from('dog_listings')
            .update({ status: 'inactive' })
            .in('id', operation.listingIds);
          break;
          
        case 'delete':
          await supabase
            .from('dog_listings')
            .delete()
            .in('id', operation.listingIds);
          break;
          
        case 'update_price':
          if (operation.data?.priceMultiplier) {
            // This would need a more complex implementation with current prices
            toast({
              title: "Bulk price update",
              description: "Price updates require individual listing updates",
              variant: "destructive"
            });
            return;
          }
          break;
      }

      toast({
        title: "Success",
        description: `Bulk ${operation.operation} completed for ${operation.listingIds.length} listings`
      });
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast({
        title: "Error",
        description: "Bulk operation failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    trackListingView,
    trackListingInquiry,
    getListingAnalytics,
    bulkUpdateListings
  };
};
