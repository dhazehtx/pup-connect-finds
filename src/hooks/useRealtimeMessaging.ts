
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeConversations } from './useRealtimeConversations';
import { useRealtimeMessages } from './useRealtimeMessages';
import { useRealtimeTyping } from './useRealtimeTyping';
import { useMessageSearch } from './useMessageSearch';

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

export const useRealtimeMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    setLoading
  } = useRealtimeConversations();
  
  const {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    markAsRead
  } = useRealtimeMessages();
  
  const {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription
  } = useRealtimeTyping();
  
  const { searchMessages } = useMessageSearch();

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let messagesChannel: any;
    let conversationsChannel: any;

    const setupRealtimeSubscriptions = () => {
      // Subscribe to new messages
      messagesChannel = supabase
        .channel('messages-changes')
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
            
            // Show toast for new messages from others
            if (newMessage.sender_id !== user.id) {
              const displayContent = newMessage.is_encrypted 
                ? "New encrypted message" 
                : (newMessage.content?.substring(0, 50) + "..." || "New message");
              
              toast({
                title: "New Message",
                description: displayContent,
              });
            }
          }
        )
        .subscribe();

      // Subscribe to conversation updates
      conversationsChannel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscriptions();

    return () => {
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (conversationsChannel) supabase.removeChannel(conversationsChannel);
    };
  }, [user, fetchConversations, toast, setMessages]);

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchConversations().finally(() => setLoading(false));
    }
  }, [user, fetchConversations, setLoading]);

  return {
    messages,
    conversations,
    loading,
    typingUsers,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    sendTypingIndicator,
    searchMessages,
    refreshConversations: fetchConversations,
    setupTypingSubscription
  };
};
