
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExtendedConversation, Message } from '@/types/messaging';

export const useEnhancedMessaging = () => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for conversations - replace with actual Supabase queries
      const mockConversations: ExtendedConversation[] = [
        {
          id: '1',
          listing_id: '1',
          buyer_id: 'buyer_1',
          seller_id: 'seller_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          last_message: {
            content: 'Hi, is this puppy still available?',
            created_at: new Date().toISOString(),
            sender_id: 'buyer_1'
          },
          other_user: {
            id: 'buyer_1',
            full_name: 'John Smith',
            username: 'johnsmith',
            avatar_url: undefined
          },
          listing: {
            id: '1',
            dog_name: 'Buddy',
            breed: 'Golden Retriever',
            images: []
          },
          unread_count: 2
        },
        {
          id: '2',
          listing_id: '2',
          buyer_id: 'buyer_2',
          seller_id: 'seller_2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          last_message: {
            content: 'Thank you for your interest!',
            created_at: new Date().toISOString(),
            sender_id: 'seller_2'
          },
          other_user: {
            id: 'buyer_2',
            full_name: 'Sarah Johnson',
            username: 'sarahj',
            avatar_url: undefined
          },
          listing: {
            id: '2',
            dog_name: 'Luna',
            breed: 'Labrador',
            images: []
          },
          unread_count: 0
        }
      ];

      setConversations(mockConversations);
    } catch (err) {
      setError('Failed to load conversations');
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: '1',
          conversation_id: conversationId,
          sender_id: 'buyer_1',
          content: 'Hi, is this puppy still available?',
          created_at: new Date().toISOString(),
          message_type: 'text'
        },
        {
          id: '2',
          conversation_id: conversationId,
          sender_id: 'seller_1',
          content: 'Yes, the puppy is still available!',
          created_at: new Date().toISOString(),
          message_type: 'text'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string, type: string = 'text') => {
    try {
      // Mock sending message - replace with actual Supabase mutation
      console.log('Sending message:', { conversationId, content, type });
      
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        sender_id: 'current_user',
        content,
        created_at: new Date().toISOString(),
        message_type: type as 'text' | 'image' | 'file' | 'voice'
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update local state optimistically
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                last_message: {
                  content,
                  created_at: new Date().toISOString(),
                  sender_id: 'current_user'
                },
                updated_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
              }
            : conv
        )
      );

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });

      return newMessage;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    markAsRead,
    sendMessage
  };
};
