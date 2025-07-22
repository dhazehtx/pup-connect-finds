
import { useEffect, useCallback } from 'react';
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

interface UseRealtimeSubscriptionsProps {
  conversationId?: string;
  onNewMessage: (message: Message) => void;
  onConversationUpdate: () => void;
}

export const useRealtimeSubscriptions = ({ 
  conversationId, 
  onNewMessage, 
  onConversationUpdate 
}: UseRealtimeSubscriptionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
          onNewMessage(newMessage);
          
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
          onConversationUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, conversationId, onNewMessage, onConversationUpdate, toast]);
};
