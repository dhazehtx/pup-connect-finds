
import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
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

export const useMessageFetcher = () => {
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const data = await apiRequest(`/messaging/conversations/${conversationId}/messages`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    fetchMessages
  };
};
