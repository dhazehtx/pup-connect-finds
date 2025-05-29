
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePolling } from './usePolling';

interface UseRealtimeProps {
  onUpdate?: (payload?: any) => void;
  interval?: number;
  enabled?: boolean;
}

export const useRealtime = ({ onUpdate, interval = 5000, enabled = true }: UseRealtimeProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const handlePoll = async () => {
    if (onUpdate) {
      await onUpdate();
    }
  };

  const { isPolling } = usePolling({
    onPoll: handlePoll,
    interval,
    enabled: enabled && !!user
  });

  useEffect(() => {
    setIsConnected(isPolling && !!user);
    console.log('Realtime connection status:', isPolling && !!user, 'interval:', interval);
  }, [isPolling, user, interval]);

  return { isConnected };
};

// Hook for polling messages
export const useRealtimeMessages = (conversationId: string, onNewMessage?: (message?: any) => void) => {
  const { user } = useAuth();

  // Only set up polling for real conversations (not demo ones) when user is authenticated
  const isRealConversation = !conversationId.startsWith('demo-') && !!user;
  
  console.log('Setting up message polling for conversation:', conversationId, 'isReal:', isRealConversation);

  return useRealtime({
    onUpdate: async () => {
      console.log('Polling messages for conversation:', conversationId);
      if (onNewMessage) {
        await onNewMessage();
      }
    },
    interval: 3000, // Poll every 3 seconds for messages
    enabled: isRealConversation // Only poll real conversations
  });
};

// Hook for polling favorites
export const useRealtimeFavorites = (onFavoriteUpdate?: (payload?: any) => void) => {
  const { user } = useAuth();

  console.log('Setting up favorites polling');

  return useRealtime({
    onUpdate: async () => {
      console.log('Polling favorites updates');
      if (onFavoriteUpdate) {
        await onFavoriteUpdate();
      }
    },
    interval: 10000, // Poll every 10 seconds for favorites
    enabled: !!user
  });
};

// Hook for polling listings
export const useRealtimeListings = (onListingUpdate?: (payload?: any) => void) => {
  console.log('Setting up listings polling');

  return useRealtime({
    onUpdate: async () => {
      console.log('Polling listings updates');
      if (onListingUpdate) {
        await onListingUpdate();
      }
    },
    interval: 15000, // Poll every 15 seconds for listings
    enabled: true
  });
};
