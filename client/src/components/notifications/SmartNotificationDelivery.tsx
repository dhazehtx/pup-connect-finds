
import React, { useEffect } from 'react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useAuth } from '@/contexts/AuthContext';

const SmartNotificationDelivery = () => {
  const { settings, requestNotificationPermission } = useEnhancedNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Request notification permission on first load if enabled
    if (user && settings.push_enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    }
  }, [user, settings.push_enabled, requestNotificationPermission]);

  useEffect(() => {
    // Set up service worker for background notifications
    if ('serviceWorker' in navigator && settings.push_enabled) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, [settings.push_enabled]);

  // Component doesn't render anything - it's just for side effects
  return null;
};

export default SmartNotificationDelivery;
