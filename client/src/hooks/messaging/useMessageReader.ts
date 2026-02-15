
import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const useMessageReader = () => {
  const { user } = useAuth();

  const markAsRead = useCallback(async (conversationIdOrMessageIds: string | string[]) => {
    if (!user) return;

    const conversationId = typeof conversationIdOrMessageIds === 'string'
      ? conversationIdOrMessageIds
      : null;

    if (!conversationId) return;

    try {
      await apiRequest(`/messaging/conversations/${conversationId}/mark-read`, { method: 'POST' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  return {
    markAsRead
  };
};
