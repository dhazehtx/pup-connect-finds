
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsEvent, UserActivityMetrics, ListingPerformanceMetrics, PlatformMetrics } from '@/types/analytics';

export const useAnalytics = () => {
  const [userMetrics, setUserMetrics] = useState<UserActivityMetrics | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [listingMetrics, setListingMetrics] = useState<ListingPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const trackEvent = useCallback(async (
    eventType: AnalyticsEvent['event_type'],
    eventData: any = {},
    targetId?: string
  ) => {
    try {
      const sessionId = sessionStorage.getItem('session_id') || `session_${Date.now()}`;
      sessionStorage.setItem('session_id', sessionId);

      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: eventType,
          event_data: {
            ...eventData,
            target_id: targetId,
            timestamp: new Date().toISOString()
          },
          session_id: sessionId,
          page_url: window.location.pathname,
          user_agent: navigator.userAgent
        });

      // Also track in user_interactions for recommendation engine
      if (user && targetId) {
        await supabase
          .from('user_interactions')
          .insert({
            user_id: user.id,
            interaction_type: eventType,
            target_type: getTargetType(eventType),
            target_id: targetId,
            metadata: eventData,
            session_id: sessionId
          });
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user]);

  const getTargetType = (eventType: string) => {
    switch (eventType) {
      case 'listing_view':
      case 'favorite_added':
      case 'contact_seller':
        return 'listing';
      case 'message_sent':
        return 'conversation';
      default:
        return 'page';
    }
  };

  const loadUserMetrics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-analytics', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      setUserMetrics(data);
    } catch (error) {
      console.error('Error loading user metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadPlatformMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-platform-analytics');
      if (error) throw error;
      setPlatformMetrics(data);
    } catch (error) {
      console.error('Error loading platform metrics:', error);
    }
  }, []);

  const loadListingMetrics = useCallback(async (listingIds?: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-listing-analytics', {
        body: { listing_ids: listingIds }
      });

      if (error) throw error;
      setListingMetrics(data || []);
    } catch (error) {
      console.error('Error loading listing metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInsights = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-user-insights', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating insights:', error);
      return null;
    }
  }, [user]);

  const getAnalytics = useCallback(async () => {
    // Mock analytics data
    return {
      pageViews: Math.floor(Math.random() * 1000) + 500,
      uniqueVisitors: Math.floor(Math.random() * 500) + 200,
      conversionRate: Math.random() * 5 + 2
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadUserMetrics();
    }
  }, [user, loadUserMetrics]);

  return {
    userMetrics,
    platformMetrics,
    listingMetrics,
    loading,
    trackEvent,
    loadUserMetrics,
    loadPlatformMetrics,
    loadListingMetrics,
    generateInsights,
    getAnalytics
  };
};
