
import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

export const useMessageOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text', 
    imageUrl?: string
  ): Promise<Message | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return null;
    }

    try {
      const data = await apiRequest('/messaging/messages', {
        method: 'POST',
        body: { conversation_id: conversationId, content }
      });

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await apiRequest(`/messaging/conversations/${conversationId}/mark-read`, { method: 'POST' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  return {
    sendMessage,
    markAsRead
  };
};
