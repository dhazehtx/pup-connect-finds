
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onlineUsers: string[];
  setUserOnline: () => Promise<void>;
  setUserOffline: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    setConnectionStatus('connecting');

    // Set up presence channel for online users
    const presenceChannel = supabase.channel('user-presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users = Object.keys(presenceState);
        setOnlineUsers(users);
        setIsConnected(true);
        setConnectionStatus('connected');
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => [...new Set([...prev, key])]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(userId => userId !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [user]);

  const setUserOnline = async () => {
    if (!user) return;
    
    const channel = supabase.channel('user-presence');
    await channel.track({
      user_id: user.id,
      online_at: new Date().toISOString()
    });
  };

  const setUserOffline = async () => {
    const channel = supabase.channel('user-presence');
    await channel.untrack();
  };

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      connectionStatus,
      onlineUsers,
      setUserOnline,
      setUserOffline
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
