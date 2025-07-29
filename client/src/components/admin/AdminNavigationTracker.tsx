import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { logToSupabase } from '@/utils/logToSupabase';
import { logAdminAction } from '@/utils/logger';

const AdminNavigationTracker = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const previousLocation = useRef<string>('');

  useEffect(() => {
    // Only track navigation for authenticated admin users
    if (!user || !profile?.is_admin) {
      return;
    }

    // Skip initial load or same page navigation
    if (!previousLocation.current || previousLocation.current === location.pathname) {
      previousLocation.current = location.pathname;
      return;
    }

    // Log the navigation event
    const trackNavigation = async () => {
      try {
        const navigationData = {
          from: previousLocation.current,
          to: location.pathname,
          search: location.search,
          hash: location.hash,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        };

        // Log to both Supabase and client-side logger
        await logToSupabase(`Navigated to ${location.pathname}`, navigationData);
        
        logAdminAction('Admin navigation event', {
          event_type: 'NAVIGATION',
          ...navigationData
        });

        console.log(`[Admin Navigation] ${previousLocation.current} → ${location.pathname}`);
      } catch (error) {
        console.error('Failed to track admin navigation:', error);
      }
    };

    trackNavigation();
    previousLocation.current = location.pathname;
  }, [location, user, profile]);

  // Log initial page load for admin users
  useEffect(() => {
    if (user && profile?.is_admin && !previousLocation.current) {
      const trackInitialLoad = async () => {
        try {
          const initialLoadData = {
            page: location.pathname,
            search: location.search,
            hash: location.hash,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            session_start: true
          };

          await logToSupabase(`Initial page load: ${location.pathname}`, initialLoadData);
          
          logAdminAction('Admin session started', {
            event_type: 'SESSION_START',
            ...initialLoadData
          });

          console.log(`[Admin Session] Started at ${location.pathname}`);
        } catch (error) {
          console.error('Failed to track initial admin load:', error);
        }
      };

      trackInitialLoad();
      previousLocation.current = location.pathname;
    }
  }, [user, profile, location]);

  return null; // This component doesn't render anything
};

export default AdminNavigationTracker;