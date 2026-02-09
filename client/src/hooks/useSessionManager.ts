import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // 2 minutes before timeout
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export function useSessionManager() {
  const { user, signOut } = useAuth();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  const userRef = useRef(user);
  userRef.current = user;

  const updateLastActive = useCallback(() => {
    if (userRef.current) {
      localStorage.setItem('lastActive', Date.now().toString());
    }
  }, []);

  const checkSessionExpiry = useCallback(() => {
    if (!userRef.current) return;

    const lastActive = localStorage.getItem('lastActive');
    if (!lastActive) {
      localStorage.setItem('lastActive', Date.now().toString());
      return;
    }

    const timeSinceActive = Date.now() - parseInt(lastActive);

    if (timeSinceActive > SESSION_TIMEOUT) {
      setShowWarningModal(false);
      signOutRef.current();
    } else if (timeSinceActive > SESSION_TIMEOUT - WARNING_BEFORE) {
      setShowWarningModal(true);
    }
  }, []);

  const handleExtendSession = useCallback(() => {
    localStorage.setItem('lastActive', Date.now().toString());
    setShowWarningModal(false);
  }, []);

  const handleManualLogout = useCallback(() => {
    setShowWarningModal(false);
    signOutRef.current();
  }, []);

  const refreshToken = useCallback(async () => {
    if (!userRef.current) return;
    try {
      localStorage.setItem('lastActive', Date.now().toString());
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setShowWarningModal(false);
      return;
    }

    // Reset lastActive on sign-in so stale timestamps don't trigger immediate signOut
    localStorage.setItem('lastActive', Date.now().toString());

    const handleActivity = () => {
      localStorage.setItem('lastActive', Date.now().toString());
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session expiry every minute — do NOT check immediately on mount
    const sessionCheckInterval = setInterval(checkSessionExpiry, 60 * 1000);

    const refreshInterval = setInterval(() => {
      const lastActive = localStorage.getItem('lastActive');
      if (lastActive && Date.now() - parseInt(lastActive) < 10 * 60 * 1000) {
        refreshToken();
      }
    }, 10 * 60 * 1000);

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
      clearInterval(refreshInterval);
    };
  }, [user?.id, checkSessionExpiry, refreshToken]);

  return {
    updateLastActive,
    checkSessionExpiry,
    refreshToken,
    showWarningModal,
    handleExtendSession,
    handleManualLogout
  };
}
