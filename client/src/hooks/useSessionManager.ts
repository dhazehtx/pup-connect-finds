import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { startSessionTimeout, stopSessionTimeout } from '@/utils/sessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { setupAuthStateListener } from '@/utils/authStateListener';

export const useSessionManager = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleSessionTimeout = useCallback(async () => {
    setShowWarningModal(false);
    toast({
      title: "Session Expired",
      description: "You've been logged out due to inactivity for security.",
      variant: "destructive",
    });
    
    await signOut();
  }, [signOut, toast]);

  const handleSessionWarning = useCallback(() => {
    setShowWarningModal(true);
  }, []);

  const handleExtendSession = useCallback(() => {
    setShowWarningModal(false);
    // Activity will automatically reset the timers
  }, []);

  const handleManualLogout = useCallback(async () => {
    setShowWarningModal(false);
    await signOut();
  }, [signOut]);

  const handleTokenRefresh = useCallback(async () => {
    try {
      // First check current session validity
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.warn('Session expired or invalid — signing out');
        await handleSessionTimeout();
        return;
      }

      // If session exists but token is near expiry, refresh it
      const expiresAt = sessionData.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh if less than 10 minutes remaining
      if (timeUntilExpiry < 600) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Token refresh failed:', error);
          await handleSessionTimeout();
        } else {
          console.log('Token refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await handleSessionTimeout();
    }
  }, [handleSessionTimeout]);

  useEffect(() => {
    if (!user) return;

    // Start session timeout monitoring with warning
    const cleanup = startSessionTimeout(handleSessionTimeout, handleSessionWarning, 30, 2);

    // Set up token refresh interval (every 15 minutes for failsafe checking)
    const refreshInterval = setInterval(handleTokenRefresh, 15 * 60 * 1000);

    // Set up comprehensive auth state listener
    const subscription = setupAuthStateListener();
    
    // Additional listener for session management specific events
    const { data: { subscription: sessionSubscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed via Supabase auth listener');
      } else if (event === 'SIGNED_OUT') {
        stopSessionTimeout();
        clearInterval(refreshInterval);
      }
    });

    return () => {
      cleanup();
      clearInterval(refreshInterval);
      subscription.unsubscribe();
      sessionSubscription.unsubscribe();
    };
  }, [user, handleSessionTimeout, handleSessionWarning, handleTokenRefresh]);

  // Return modal state and handlers for external usage
  return {
    showWarningModal,
    handleExtendSession,
    handleManualLogout
  };
};