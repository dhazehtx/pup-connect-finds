
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealtimeProps {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate?: (payload: any) => void;
}

export const useRealtime = ({ table, event = '*', filter, onUpdate }: UseRealtimeProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          onUpdate?.(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [table, event, filter, onUpdate, user]);

  return { isConnected };
};

// Hook for real-time messaging
export const useRealtimeMessages = (conversationId: string, onNewMessage?: (message: any) => void) => {
  const { user } = useAuth();

  return useRealtime({
    table: 'messages',
    event: 'INSERT',
    filter: `conversation_id=eq.${conversationId}`,
    onUpdate: (payload) => {
      if (payload.new && payload.new.sender_id !== user?.id) {
        onNewMessage?.(payload.new);
      }
    }
  });
};

// Hook for real-time favorites
export const useRealtimeFavorites = (onFavoriteUpdate?: (payload: any) => void) => {
  const { user } = useAuth();

  return useRealtime({
    table: 'favorites',
    filter: `user_id=eq.${user?.id}`,
    onUpdate: onFavoriteUpdate
  });
};

// Hook for real-time listings
export const useRealtimeListings = (onListingUpdate?: (payload: any) => void) => {
  return useRealtime({
    table: 'dog_listings',
    event: '*',
    onUpdate: onListingUpdate
  });
};
