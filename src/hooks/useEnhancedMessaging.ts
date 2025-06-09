
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

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

export const useEnhancedMessaging = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    loading, 
    fetchConversations, 
    createConversation 
  } = useRealtimeConversations();
  
  const { 
    messages, 
    setMessages, 
    fetchMessages, 
    sendMessage: sendMessageBase 
  } = useRealtimeMessages();

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text') => {
    return await sendMessageBase(conversationId, content, messageType);
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, setMessages]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
  };
};
