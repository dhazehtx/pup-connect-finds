
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
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

export const useEnhancedMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const { 
    conversations, 
    loading, 
    fetchConversations, 
    createConversation 
  } = useRealtimeConversations();
  
  const { 
    messages, 
    setMessages, 
    fetchMessages: fetchMessagesBase, 
    sendMessage: sendMessageBase 
  } = useRealtimeMessages();

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      setCurrentConversationId(conversationId);
      await fetchMessagesBase(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text', 
    imageUrl?: string
  ) => {
    try {
      console.log('Sending message:', { conversationId, content, messageType });
      const result = await sendMessageBase(conversationId, content, messageType, imageUrl);
      
      if (result && user) {
        console.log('Message sent successfully:', result.id);
        
        // Update local messages immediately for better UX
        if (conversationId === currentConversationId) {
          setMessages(prev => [...prev, result]);
        }
        
        // Show success feedback for image uploads
        if (messageType === 'image') {
          toast({
            title: "Image sent",
            description: "Your image was sent successfully",
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching conversations');
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Set up real-time subscriptions for new messages
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time message subscription');
    
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
          console.log('New message received via realtime:', newMessage.id);
          
          // Only add to current conversation if it matches
          if (newMessage.conversation_id === currentConversationId) {
            setMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
          }
          
          // Show notification for messages from others
          if (newMessage.sender_id !== user.id) {
            toast({
              title: "New message",
              description: newMessage.content.substring(0, 50) + "...",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, setMessages, currentConversationId, toast]);

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
