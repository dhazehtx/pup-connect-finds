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
    localStorage.setItem('lastActive', Date.now().toString());
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

    const sessionCheckInterval = setInterval(checkSessionExpiry, 60 * 1000);

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [user?.id, checkSessionExpiry]);

  return {
    updateLastActive,
    checkSessionExpiry,
    refreshToken,
    showWarningModal,
    handleExtendSession,
    handleManualLogout
  };
}
