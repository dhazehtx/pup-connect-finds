
import { useState, useCallback, useEffect } from 'react';
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
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

export const useRealtimeMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Messages fetched:', data?.length || 0);
      setMessages(data || []);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text', imageUrl?: string) => {
    if (!user) {
      console.error('No user found when trying to send message');
      return null;
    }

    try {
      console.log('Sending message:', { conversationId, content, messageType, imageUrl });
      
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        ...(imageUrl && { image_url: imageUrl })
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data.id);

      // Update conversation last message timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation timestamp:', updateError);
      }

      // Add message to local state immediately for better UX
      if (conversationId === currentConversationId) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }

      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      console.log('Marking messages as read for conversation:', conversationId);
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        console.log('Messages marked as read successfully');
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  // Set up real-time subscriptions for messages
  useEffect(() => {
    if (!user || !currentConversationId) return;

    console.log('Setting up real-time subscription for conversation:', currentConversationId);
    
    const channel = supabase
      .channel(`messages-${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received via realtime:', newMessage.id);
          
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          
          // Show notification for messages from others
          if (newMessage.sender_id !== user.id) {
            toast({
              title: "New message",
              description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : ""),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          console.log('Message updated via realtime:', updatedMessage.id);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, currentConversationId, toast]);

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    markAsRead
  };
};
