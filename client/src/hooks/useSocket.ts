import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

let globalSocket: Socket | null = null;
let globalSocketUserId: string | null = null;

export const useSocket = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        globalSocketUserId = null;
      }
      setConnected(false);
      return;
    }

    if (globalSocket && globalSocketUserId === user.id && globalSocket.connected) {
      setConnected(true);
      return;
    }

    const connectSocket = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        if (globalSocket) {
          globalSocket.disconnect();
        }

        globalSocket = io(window.location.origin, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          auth: { token: session.access_token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10,
        });

        globalSocketUserId = user.id;

        globalSocket.on('connect', () => {
          setConnected(true);
          reconnectAttempt.current = 0;
        });

        globalSocket.on('disconnect', () => {
          setConnected(false);
        });

        globalSocket.on('connect_error', () => {
          reconnectAttempt.current += 1;
        });
      } catch (err) {
        console.error('[Socket] Connection error:', err);
      }
    };

    connectSocket();

    return () => {
      // Don't disconnect on unmount - keep global connection alive
    };
  }, [user]);

  const joinConversation = useCallback((conversationId: string) => {
    globalSocket?.emit('join:conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    globalSocket?.emit('leave:conversation', conversationId);
  }, []);

  const emitTypingStart = useCallback((conversationId: string) => {
    globalSocket?.emit('typing:start', { conversationId });
  }, []);

  const emitTypingStop = useCallback((conversationId: string) => {
    globalSocket?.emit('typing:stop', { conversationId });
  }, []);

  const emitNewMessage = useCallback((conversationId: string, message: any) => {
    globalSocket?.emit('message:new', { conversationId, message });
  }, []);

  const emitMessagesRead = useCallback((conversationId: string) => {
    globalSocket?.emit('messages:read', { conversationId });
  }, []);

  const onEvent = useCallback((event: string, handler: (...args: any[]) => void) => {
    globalSocket?.on(event, handler);
    return () => {
      globalSocket?.off(event, handler);
    };
  }, []);

  return {
    socket: globalSocket,
    connected,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    emitNewMessage,
    emitMessagesRead,
    onEvent,
  };
};
