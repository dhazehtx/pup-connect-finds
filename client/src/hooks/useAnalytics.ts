import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AnalyticsService from '../utils/analytics';

// Hook for automatic page view tracking
export const usePageTracking = () => {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view when location changes
    const pageTitle = document.title;
    AnalyticsService.trackPageView(location, pageTitle);
  }, [location]);
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

export default AnalyticsService;