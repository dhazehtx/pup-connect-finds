
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'video' | 'file';
  created_at: string;
  read_at?: string;
  edited_at?: string;
  reply_to?: string;
  image_url?: string;
  file_url?: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  buyer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  seller?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  listing?: {
    id: string;
    title: string;
    dog_name: string;
    breed?: string;
    image_url?: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations using mock data for now to avoid database relation issues
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Mock conversations data - replace with actual database query once relations are fixed
      const mockConversations: Conversation[] = [
        {
          id: '1',
          buyer_id: 'buyer_1',
          seller_id: 'seller_1',
          listing_id: '1',
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          other_user: {
            id: 'user_1',
            full_name: 'John Smith',
            avatar_url: undefined
          },
          listing: {
            id: '1',
            title: 'Golden Retriever Puppy',
            dog_name: 'Buddy',
            breed: 'Golden Retriever',
            image_url: undefined
          },
          unread_count: 2
        },
        {
          id: '2',
          buyer_id: 'buyer_2',
          seller_id: 'seller_2',
          listing_id: '2',
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          other_user: {
            id: 'user_2',
            full_name: 'Sarah Johnson',
            avatar_url: undefined
          },
          listing: {
            id: '2',
            title: 'Labrador Puppy',
            dog_name: 'Luna',
            breed: 'Labrador',
            image_url: undefined
          },
          unread_count: 0
        }
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchConversations = loadConversations;

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      
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
      setActiveConversation(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: Message['message_type'] = 'text',
    fileUrl?: string
  ) => {
    if (!user) return;

    try {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        message_type: messageType,
        file_url: fileUrl
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation last message time
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, last_message_at: new Date().toISOString() }
            : conv
        )
      );

      return newMessage;
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

  // Start a new conversation
  const startConversation = useCallback(async (
    otherUserId: string,
    listingId?: string
  ) => {
    if (!user) return;

    try {
      // Mock creating a new conversation
      const newConversationId = crypto.randomUUID();
      
      const newConversation: Conversation = {
        id: newConversationId,
        buyer_id: user.id,
        seller_id: otherUserId,
        listing_id: listingId,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: otherUserId,
          full_name: 'New User',
          avatar_url: undefined
        },
        unread_count: 0
      };

      setConversations(prev => [newConversation, ...prev]);
      return newConversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    typing,
    loadMessages,
    sendMessage,
    startConversation,
    setActiveConversation,
    fetchConversations,
  };
};
