
import { useState, useEffect, useCallback } from 'react';
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
  created_at: string;
  read_at?: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

interface Conversation {
  id: string;
  listing_id?: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export const useRealtimeMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await apiRequest('/messaging/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiRequest(`/messaging/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text',
    imageUrl?: string
  ) => {
    if (!user) return;

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

  const subscribeToConversation = useCallback((conversationId: string) => {
    return () => {};
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    subscribeToConversation
  };
};
