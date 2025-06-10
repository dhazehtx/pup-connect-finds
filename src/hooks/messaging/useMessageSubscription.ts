
import { useEffect } from 'react';
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

interface UseMessageSubscriptionProps {
  conversationId: string | null;
  onNewMessage: (message: Message) => void;
  onMessageUpdate: (message: Message) => void;
}

export const useMessageSubscription = ({
  conversationId,
  onNewMessage,
  onMessageUpdate
}: UseMessageSubscriptionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !conversationId) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);
    
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received via realtime:', newMessage.id);
          
          onNewMessage(newMessage);
          
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
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          console.log('Message updated via realtime:', updatedMessage.id);
          
          onMessageUpdate(updatedMessage);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, conversationId, onNewMessage, onMessageUpdate, toast]);
};
