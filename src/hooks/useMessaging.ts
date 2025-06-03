
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at?: string;
  message_type: 'text' | 'image';
  image_url?: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's conversations
  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));

      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          image_url: imageUrl
        }])
        .select()
        .single();

      if (error) throw error;

      // Add message to local state
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), data]
      }));

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create a new conversation
  const createConversation = async (sellerId: string, listingId?: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('listing_id', listingId)
        .single();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          buyer_id: user.id,
          seller_id: sellerId,
          listing_id: listingId
        }])
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      // Update local state
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg => 
          msg.sender_id !== user.id && !msg.read_at 
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
  };
};
