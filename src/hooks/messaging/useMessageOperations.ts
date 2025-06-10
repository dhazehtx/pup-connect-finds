
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessageOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text', 
    imageUrl?: string
  ) => {
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
  }, [user, toast]);

  const markAsRead = useCallback(async (conversationId: string) => {
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
  }, [user]);

  return {
    sendMessage,
    markAsRead
  };
};
