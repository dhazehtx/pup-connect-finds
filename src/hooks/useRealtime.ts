
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generic realtime hook for any table
export const useRealtimeSubscription = (
  table: string, 
  callback: (payload: any) => void,
  filter?: string
) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        callback
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [table, user, filter]);

  return { isConnected };
};

// Specialized hook for messages
export const useRealtimeMessages = (
  conversationId: string,
  onMessage: () => void
) => {
  return useRealtimeSubscription(
    'messages',
    (payload) => {
      console.log('New message received:', payload);
      onMessage();
    },
    `conversation_id=eq.${conversationId}`
  );
};

// Specialized hook for favorites
export const useRealtimeFavorites = (onUpdate: () => void) => {
  const { user } = useAuth();
  
  return useRealtimeSubscription(
    'favorites',
    (payload) => {
      console.log('Favorites updated:', payload);
      // Add polling fallback for reliability
      setTimeout(onUpdate, 1000);
    },
    user ? `user_id=eq.${user.id}` : undefined
  );
};

// Polling fallback hook
export const usePolling = (
  callback: () => void,
  interval: number = 30000,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const poll = setInterval(callback, interval);
    return () => clearInterval(poll);
  }, [callback, interval, enabled]);
};
