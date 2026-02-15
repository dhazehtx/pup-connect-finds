
import { useState } from 'react';
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
}

export const useMessagesManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await apiRequest(`/messaging/conversations/${conversationId}/messages`);
      const validMessages = (Array.isArray(data) ? data : []).filter((msg: any) => msg.content !== null) as Message[];
      setMessages(validMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text') => {
    if (!user) return;

    try {
      const data = await apiRequest('/messaging/messages', {
        method: 'POST',
        body: { conversation_id: conversationId, content }
      });

      await fetchMessages(conversationId);

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
  };

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
  };
};
