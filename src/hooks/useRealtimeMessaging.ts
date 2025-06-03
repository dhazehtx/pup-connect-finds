
import { useEffect, useState, useCallback } from 'react';
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
  created_at: string;
  read_at?: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeMessaging = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:dog_listings(dog_name, breed, image_url),
          buyer_profile:profiles!buyer_id(full_name, username, avatar_url),
          seller_profile:profiles!seller_id(full_name, username, avatar_url)
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
  }, [user, toast]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, username, avatar_url)
        `)
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

  // Send a new message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    imageUrl?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          image_url: imageUrl,
          is_encrypted: false
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

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Create or get existing conversation
  const createConversation = useCallback(async (
    buyerId: string,
    sellerId: string,
    listingId?: string
  ) => {
    try {
      // First check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('listing_id', listingId)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          buyer_id: buyerId,
          seller_id: sellerId,
          listing_id: listingId
        }])
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
    }
  }, [toast]);

  // Mark messages as read
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

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        typing: isTyping,
        timestamp: new Date().toISOString()
      }
    });
  }, [user]);

  // Search messages
  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('*')
        .ilike('content', `%${query}%`);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      } else if (user) {
        // Search in user's conversations only
        const { data: userConversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (userConversations) {
          const conversationIds = userConversations.map(c => c.id);
          queryBuilder = queryBuilder.in('conversation_id', conversationIds);
        }
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let messagesChannel: any;
    let conversationsChannel: any;
    let typingChannel: any;

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

      // Subscribe to typing indicators
      typingChannel = supabase
        .channel('typing-indicators')
        .on('broadcast', { event: 'typing' }, (payload) => {
          const { user_id, typing } = payload.payload;
          
          if (user_id !== user.id) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (typing) {
                newSet.add(user_id);
                // Auto-remove after 3 seconds
                setTimeout(() => {
                  setTypingUsers(current => {
                    const updated = new Set(current);
                    updated.delete(user_id);
                    return updated;
                  });
                }, 3000);
              } else {
                newSet.delete(user_id);
              }
              return newSet;
            });
          }
        })
        .subscribe();
    };

    setupRealtimeSubscriptions();

    return () => {
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (conversationsChannel) supabase.removeChannel(conversationsChannel);
      if (typingChannel) supabase.removeChannel(typingChannel);
    };
  }, [user, fetchConversations, toast]);

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchConversations().finally(() => setLoading(false));
    }
  }, [user, fetchConversations]);

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
    refreshConversations: fetchConversations
  };
};
