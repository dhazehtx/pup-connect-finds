import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export function useSessionManager() {
  const { user, signOut } = useAuth();

  const updateLastActive = useCallback(() => {
    if (user) {
      localStorage.setItem('lastActive', Date.now().toString());
    }
  }, [user]);

  const checkSessionExpiry = useCallback(() => {
    if (!user) return;

    const lastActive = localStorage.getItem('lastActive');
    if (!lastActive) {
      updateLastActive();
      return;
    }

    const timeSinceActive = Date.now() - parseInt(lastActive);
    
    if (timeSinceActive > SESSION_TIMEOUT) {
      // Session expired, trigger modal
      const event = new CustomEvent('sessionExpired', {
        detail: { status: 440, message: 'Session expired due to inactivity' }
      });
      window.dispatchEvent(event);
      
      // Sign out user
      signOut();
    }
  }, [user, signOut, updateLastActive]);

  const refreshToken = useCallback(async () => {
    if (!user) return;

    try {
      // Update last active time
      updateLastActive();
      
      // Optional: Make a lightweight API call to refresh server session
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }, [user, updateLastActive]);

  useEffect(() => {
    if (!user) return;

    // Set up activity listeners
    const handleActivity = () => {
      updateLastActive();
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session expiry every minute
    const sessionCheckInterval = setInterval(checkSessionExpiry, 60 * 1000);

    // Refresh token every 10 minutes if user is active
    const refreshInterval = setInterval(() => {
      const lastActive = localStorage.getItem('lastActive');
      if (lastActive && Date.now() - parseInt(lastActive) < 10 * 60 * 1000) {
        refreshToken();
      }
    }, 10 * 60 * 1000);

    // Initial session check
    checkSessionExpiry();

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
      clearInterval(refreshInterval);
    };
  }, [user, updateLastActive, checkSessionExpiry, refreshToken]);

  return {
    updateLastActive,
    checkSessionExpiry,
    refreshToken
  };
}