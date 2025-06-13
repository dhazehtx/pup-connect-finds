
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

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
          seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
          listing:dog_listings(id, dog_name, breed, image_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include other_user and proper listing format
      const transformedData = (data || []).map(conv => {
        const isUserBuyer = conv.buyer_id === user.id;
        const otherUser = isUserBuyer ? conv.seller : conv.buyer;
        
        return {
          ...conv,
          other_user: otherUser ? {
            id: otherUser.id,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url
          } : undefined,
          listing: conv.listing ? {
            id: conv.listing.id,
            title: conv.listing.dog_name,
            dog_name: conv.listing.dog_name,
            breed: conv.listing.breed,
            image_url: conv.listing.image_url
          } : undefined,
          unread_count: 0 // TODO: Implement unread count logic
        };
      });
      
      setConversations(transformedData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const fetchConversations = loadConversations;

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          read_at,
          image_url
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Ensure message_type matches our union type
      const validMessages = (data || []).map(msg => ({
        ...msg,
        message_type: ['text', 'image', 'voice', 'video', 'file'].includes(msg.message_type) 
          ? msg.message_type as 'text' | 'image' | 'voice' | 'video' | 'file'
          : 'text' as const
      }));
      
      setMessages(validMessages);
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
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
      };

      if (fileUrl) {
        messageData.image_url = fileUrl;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

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
  }, [user, toast]);

  // Start a new conversation
  const startConversation = useCallback(async (
    otherUserId: string,
    listingId?: string
  ) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(buyer_id.eq.${user.id},seller_id.eq.${otherUserId}),and(buyer_id.eq.${otherUserId},seller_id.eq.${user.id})`
        )
        .eq('listing_id', listingId || null)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: otherUserId,
          listing_id: listingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
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

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages in active conversation
    let messageSubscription: any;
    if (activeConversation) {
      messageSubscription = supabase
        .channel(`messages:${activeConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${activeConversation}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();
    }

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(buyer_id.eq.${user.id},seller_id.eq.${user.id})`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      messageSubscription?.unsubscribe();
      conversationSubscription?.unsubscribe();
    };
  }, [user, activeConversation, loadConversations]);

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
