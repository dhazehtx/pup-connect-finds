import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnalyticsService from '../utils/analytics';
import { useCallback, useState } from 'react';

type ListingMetric = {
  listing_id: string;
  views: number;
  unique_views: number;
  favorites: number;
  inquiries: number;
  conversion_rate: number;
  click_through_rate: number;
  bounce_rate: number;
  avg_view_duration: number;
  search_appearances: number;
  avg_position_clicked: number;
};

// Hook for automatic page view tracking
export const usePageTracking = () => {
  const location = useLocation();
  const pathKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const pageTitle = document.title;
    AnalyticsService.trackPageView(pathKey, pageTitle);
  }, [pathKey]);
};

// Hook for session time tracking
export const useSessionTracking = () => {
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000);
      AnalyticsService.trackTimeOnSite(sessionDuration);
    };

    // Track session time on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track on component unmount
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000);
      AnalyticsService.trackTimeOnSite(sessionDuration);
    };
  }, []);
};

// Custom hook for feature usage tracking
export const useFeatureTracking = () => {
  const trackFeature = (featureName: string, context?: string) => {
    AnalyticsService.trackFeatureUse(featureName, context);
  };

  return { trackFeature };
};

// Hook for error boundary analytics
export const useErrorTracking = () => {
  const trackError = (error: Error, errorInfo?: any) => {
    AnalyticsService.trackError(
      error.name || 'Unknown Error',
      error.message,
      errorInfo?.componentStack || 'Unknown context'
    );
  };

  return { trackError };
};

// Legacy analytics hook compatibility surface for dashboard components.
export const useAnalytics = () => {
  const [listingMetrics, setListingMetrics] = useState<ListingMetric[]>([]);
  const [loading, setLoading] = useState(false);

  const trackEvent = useCallback((eventName: string, parameters: Record<string, unknown> = {}) => {
    AnalyticsService.trackEvent(eventName, parameters);
  }, []);

  const loadListingMetrics = useCallback(async (listingIds: string[]) => {
    setLoading(true);
    try {
      const syntheticMetrics = listingIds.map((id) => ({
        listing_id: id,
        views: 0,
        unique_views: 0,
        favorites: 0,
        inquiries: 0,
        conversion_rate: 0,
        click_through_rate: 0,
        bounce_rate: 0,
        avg_view_duration: 0,
        search_appearances: 0,
        avg_position_clicked: 0,
      }));
      setListingMetrics(syntheticMetrics);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    return {
      listingMetrics,
      generatedAt: new Date().toISOString(),
    };
  }, [listingMetrics]);

  return {
    listingMetrics,
    loading,
    trackEvent,
    loadListingMetrics,
    getAnalytics,
  };
};

export default AnalyticsService;