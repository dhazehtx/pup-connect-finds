import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  logAdminPageView, 
  logAdminSectionSwitch, 
  AdminPageTimeTracker 
} from '@/utils/adminPageTracker';

/**
 * Custom hook for automatic admin page tracking
 * Handles page views, section switches, and time tracking
 */
export const useAdminPageTracking = (sectionName?: string) => {
  const location = useLocation();
  const previousLocationRef = useRef<string>('');
  const timeTracker = AdminPageTimeTracker.getInstance();

  useEffect(() => {
    const currentRoute = location.pathname;
    const previousRoute = previousLocationRef.current;

    // Log page view for current route
    const logPageView = async () => {
      try {
        // If there was a previous route, log the section switch with time spent
        if (previousRoute && previousRoute !== currentRoute) {
          const timeSpent = timeTracker.stopTracking();
          await logAdminSectionSwitch(previousRoute, currentRoute, timeSpent);
        }

        // Log the new page view
        await logAdminPageView({
          route: currentRoute,
          section: sectionName,
          previousRoute: previousRoute || undefined
        });

        // Start tracking time for the new page
        timeTracker.startTracking(currentRoute);
        
        // Update the previous location ref
        previousLocationRef.current = currentRoute;
      } catch (error) {
        console.error('Error in admin page tracking:', error);
      }
    };

    // Only track admin routes
    if (currentRoute.startsWith('/admin')) {
      logPageView();
    }

    // Cleanup function to log time spent when component unmounts or route changes
    return () => {
      if (currentRoute.startsWith('/admin')) {
        timeTracker.stopTracking();
      }
    };
  }, [location.pathname, sectionName]);

  // Return current time spent for components that want to display it
  const getCurrentTimeSpent = () => timeTracker.getCurrentTimeSpent();

  return {
    currentRoute: location.pathname,
    getCurrentTimeSpent
  };
};