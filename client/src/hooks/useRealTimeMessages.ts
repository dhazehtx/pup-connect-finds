
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationsFetcher } from './messaging/useConversationsFetcher';
import { useMessagesFetcher } from './messaging/useMessagesFetcher';
import { useMessageSender } from './messaging/useMessageSender';
import { useMessageReader } from './messaging/useMessageReader';
import { useConversationCreator } from './messaging/useConversationCreator';
import { useRealtimeSubscriptions } from './messaging/useRealtimeSubscriptions';

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
  sender_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const useRealTimeMessages = (conversationId?: string) => {
  const { user } = useAuth();
  
  // Use the refactored hooks
  const { conversations, loading, fetchConversations } = useConversationsFetcher();
  const { messages, setMessages, fetchMessages } = useMessagesFetcher();
  const { sending, sendMessage } = useMessageSender();
  const { markAsRead } = useMessageReader();
  const { createConversation } = useConversationCreator();

  // Handle new messages from real-time subscription
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  }, [setMessages]);

  // Set up real-time subscriptions
  useRealtimeSubscriptions({
    conversationId,
    onNewMessage: handleNewMessage,
    onConversationUpdate: fetchConversations
  });

  // Initial data fetch
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      await fetchConversations();
      if (conversationId) {
        await fetchMessages(conversationId);
      }
    };

    loadData();
  }, [user, conversationId, fetchConversations, fetchMessages]);

  return {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    markAsRead,
    createConversation,
    fetchMessages,
    fetchConversations
  };
};
