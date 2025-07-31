import { useEffect } from 'react';
import AnalyticsService from '../utils/analytics';
import { usePageTracking, useSessionTracking } from '../hooks/useAnalytics';

const Analytics = () => {
  // Initialize analytics on mount
  useEffect(() => {
    AnalyticsService.initialize();
  }, []);

  // Enable automatic tracking hooks
  usePageTracking();
  useSessionTracking();

  return null; // This component doesn't render anything
};

export default Analytics;