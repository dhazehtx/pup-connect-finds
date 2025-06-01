
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: any;
  user_id?: string;
  session_id: string;
  timestamp: string;
  page_url: string;
  user_agent?: string;
}

interface PageView {
  page: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
}

interface UserBehavior {
  clicks: number;
  page_views: number;
  session_duration: number;
  bounce_rate: number;
}

export const useRealTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState<{
    page_views: PageView[];
    user_behavior: UserBehavior;
    real_time_users: number;
  }>({
    page_views: [],
    user_behavior: {
      clicks: 0,
      page_views: 0,
      session_duration: 0,
      bounce_rate: 0
    },
    real_time_users: 0
  });
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const { user } = useAuth();

  // Track page view
  const trackPageView = async (page: string) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'page_view',
        event_data: { page },
        user_id: user?.id,
        session_id: sessionId,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      console.log('Page view tracked:', page);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  // Track user interaction
  const trackEvent = async (eventType: string, eventData: any = {}) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        event_data: eventData,
        user_id: user?.id,
        session_id: sessionId,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });

      console.log('Event tracked:', eventType, eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  // Track listing interaction
  const trackListingView = async (listingId: string, listingData: any) => {
    await trackEvent('listing_view', {
      listing_id: listingId,
      breed: listingData.breed,
      price: listingData.price,
      location: listingData.location
    });
  };

  // Track search
  const trackSearch = async (query: string, filters: any = {}) => {
    await trackEvent('search', {
      query,
      filters,
      results_count: filters.results_count || 0
    });
  };

  // Track conversion
  const trackConversion = async (type: string, value: number = 0) => {
    await trackEvent('conversion', {
      conversion_type: type,
      value
    });
  };

  // Get real-time analytics
  const fetchAnalytics = async () => {
    try {
      // Get page views for the last 24 hours
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_events')
        .select('event_data, timestamp')
        .eq('event_type', 'page_view')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (pageViewsError) throw pageViewsError;

      // Process page views
      const pageViewStats: { [key: string]: PageView } = {};
      pageViews?.forEach(event => {
        const page = event.event_data?.page || 'unknown';
        if (!pageViewStats[page]) {
          pageViewStats[page] = {
            page,
            views: 0,
            unique_visitors: 0,
            avg_time_on_page: 0
          };
        }
        pageViewStats[page].views++;
      });

      // Get current active users (last 5 minutes)
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('analytics_events')
        .select('session_id')
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (activeUsersError) throw activeUsersError;

      const uniqueActiveSessions = new Set(activeUsers?.map(u => u.session_id) || []);

      setAnalytics({
        page_views: Object.values(pageViewStats),
        user_behavior: {
          clicks: 0, // Would be calculated from click events
          page_views: pageViews?.length || 0,
          session_duration: 0, // Would be calculated from session data
          bounce_rate: 0 // Would be calculated from session data
        },
        real_time_users: uniqueActiveSessions.size
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Auto-track page changes
  useEffect(() => {
    const currentPage = window.location.pathname;
    trackPageView(currentPage);

    // Set up click tracking
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        trackEvent('click', {
          element: target.tagName,
          text: target.textContent?.substring(0, 100),
          url: target.getAttribute('href')
        });
      }
    };

    document.addEventListener('click', handleClick);
    
    // Fetch analytics on mount
    fetchAnalytics();

    // Set up real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds

    return () => {
      document.removeEventListener('click', handleClick);
      clearInterval(interval);
    };
  }, []);

  return {
    analytics,
    trackPageView,
    trackEvent,
    trackListingView,
    trackSearch,
    trackConversion,
    refreshAnalytics: fetchAnalytics
  };
};
