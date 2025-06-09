
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useMessagingNotifications } from '@/hooks/useMessagingNotifications';

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
  } = useConversations();
  
  const { 
    messages, 
    setMessages, 
    fetchMessages, 
    sendMessage: sendMessageBase 
  } = useMessages();
  
  const { sendNotificationForMessage } = useMessagingNotifications();

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text') => {
    // Send the message
    const result = await sendMessageBase(conversationId, content, messageType);
    
    // Send notification
    await sendNotificationForMessage(conversations, conversationId, content);
    
    return result;
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
