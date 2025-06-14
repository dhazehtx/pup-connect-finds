
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  sender_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  buyer_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  seller_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  listing?: {
    dog_name: string;
    breed: string;
    price: number;
    image_url: string | null;
  } | null;
}

export const useRealTimeMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch conversations for the user
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer_profile:profiles!conversations_buyer_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          seller_profile:profiles!conversations_seller_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          listing:dog_listings (
            dog_name,
            breed,
            price,
            image_url
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', convId)
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
  };

  // Send a new message
  const sendMessage = async (content: string, messageType: string = 'text', imageUrl?: string) => {
    if (!user || !conversationId) return false;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Create a new conversation
  const createConversation = async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          listing_id: listingId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification for new messages from others
          if (newMessage.sender_id !== user.id) {
            toast({
              title: "New message",
              description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
            });
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(buyer_id.eq.${user.id},seller_id.eq.${user.id})`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, conversationId]);

  // Initial data fetch
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      await fetchConversations();
      if (conversationId) {
        await fetchMessages(conversationId);
      }
      setLoading(false);
    };

    loadData();
  }, [user, conversationId]);

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
