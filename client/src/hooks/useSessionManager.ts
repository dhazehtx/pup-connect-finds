import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { startSessionTimeout, stopSessionTimeout } from '@/utils/sessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Token refresh failed:', error);
        await handleSessionTimeout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, [handleSessionTimeout]);

  useEffect(() => {
    if (!user) return;

    // Start session timeout monitoring with warning
    const cleanup = startSessionTimeout(handleSessionTimeout, handleSessionWarning, 30, 2);

    // Set up token refresh interval (every 45 minutes)
    const refreshInterval = setInterval(handleTokenRefresh, 45 * 60 * 1000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        stopSessionTimeout();
        clearInterval(refreshInterval);
      }
    });

    return () => {
      cleanup();
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, [user, handleSessionTimeout, handleSessionWarning, handleTokenRefresh]);

  // Return modal state and handlers for external usage
  return {
    showWarningModal,
    handleExtendSession,
    handleManualLogout
  };
};