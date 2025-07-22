
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessageSender = () => {
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: string = 'text', imageUrl?: string) => {
    if (!user) return false;

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
  }, [user, toast]);

  return {
    sending,
    sendMessage
  };
};
