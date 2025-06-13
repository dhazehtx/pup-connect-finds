
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExtendedConversation {
  id: string;
  listing_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  listing?: {
    id: string;
    dog_name: string;
    images?: string[];
  };
  unread_count: number;
}

export const useEnhancedMessaging = () => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: {
            content: 'Hi, is this puppy still available?',
            created_at: new Date().toISOString(),
            sender_id: 'user_1'
          },
          other_user: {
            id: 'user_1',
            full_name: 'John Smith',
            avatar_url: undefined
          },
          listing: {
            id: '1',
            dog_name: 'Buddy',
            images: []
          },
          unread_count: 2
        },
        {
          id: '2',
          listing_id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: {
            content: 'Thank you for your interest!',
            created_at: new Date().toISOString(),
            sender_id: 'user_2'
          },
          other_user: {
            id: 'user_2',
            full_name: 'Sarah Johnson',
            avatar_url: undefined
          },
          listing: {
            id: '2',
            dog_name: 'Luna',
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

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      // Mock sending message - replace with actual Supabase mutation
      console.log('Sending message:', { conversationId, content });
      
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
                updated_at: new Date().toISOString()
              }
            : conv
        )
      );

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    markAsRead,
    sendMessage
  };
};
