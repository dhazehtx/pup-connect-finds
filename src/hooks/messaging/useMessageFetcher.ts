
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useMessageFetcher = () => {
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
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
      return data || [];
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

  return {
    fetchMessages
  };
};
