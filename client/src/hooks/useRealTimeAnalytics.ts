
import { useState, useEffect } from 'react';
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

  const trackPageView = async (page: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[PROOF:DEV_ONLY] analytics page_view skipped - Neon-only policy', { page });
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  const trackEvent = async (eventType: string, eventData: any = {}) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[PROOF:DEV_ONLY] analytics event skipped - Neon-only policy', { eventType, eventData });
      }

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

  const fetchAnalytics = async () => {
    try {
      console.log('[PROOF:DEV_ONLY] analytics fetch skipped - Neon-only policy');
      setAnalytics({
        page_views: [],
        user_behavior: {
          clicks: 0,
          page_views: 0,
          session_duration: 0,
          bounce_rate: 0
        },
        real_time_users: 0
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
