
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '@/hooks/useSocket';

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
  const { socket, connected, onEvent } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const connectionStatus: 'connected' | 'connecting' | 'disconnected' =
    connected ? 'connected' : user ? 'connecting' : 'disconnected';

  useEffect(() => {
    if (!connected) return;

    const cleanupList = onEvent('presence:list', (data: { users: string[] }) => {
      setOnlineUsers(data.users);
    });

    const cleanupOnline = onEvent('presence:online', (data: { userId: string }) => {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    });

    const cleanupOffline = onEvent('presence:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    socket?.emit('presence:list');

    return () => {
      cleanupList?.();
      cleanupOnline?.();
      cleanupOffline?.();
    };
  }, [connected, onEvent, socket]);

  const setUserOnline = useCallback(async () => {
  }, []);

  const setUserOffline = useCallback(async () => {
  }, []);

  return (
    <RealtimeContext.Provider value={{
      isConnected: connected,
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
