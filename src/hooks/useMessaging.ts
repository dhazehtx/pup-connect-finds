
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  unread_count?: number;
}

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

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          dog_listings:listing_id (
            dog_name,
            breed,
            image_url
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithProfiles = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            listing: conv.dog_listings,
            other_user: profileData || {
              full_name: null,
              username: null,
              avatar_url: null
            },
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithProfiles);
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
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: string = 'text') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        }])
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message timestamp
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Refresh messages
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
  }, [user, fetchMessages, toast]);

  const createConversation = useCallback(async (listingId: string, sellerId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, fetchConversations, toast]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
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
            toast({
              title: "New Message",
              description: newMessage.content.substring(0, 50) + "...",
            });
          }
        }
      )
      .subscribe();

    const conversationsChannel = supabase
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

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, fetchConversations, toast]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead
  };
};
