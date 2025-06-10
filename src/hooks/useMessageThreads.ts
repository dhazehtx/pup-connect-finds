
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ThreadMessage {
  id: string;
  parent_message_id: string;
  reply_message_id: string;
  created_at: string;
}

export const useMessageThreads = () => {
  const [threads, setThreads] = useState<Record<string, ThreadMessage[]>>({});
  const { user } = useAuth();

  const getThreadCount = useCallback((messageId: string) => {
    return threads[messageId]?.length || 0;
  }, [threads]);

  const sendThreadReply = useCallback(async (parentMessageId: string, replyContent: string) => {
    if (!user) return;

    try {
      // First create the reply message
      const { data: replyMessage, error: replyError } = await supabase
        .from('messages')
        .insert({
          conversation_id: parentMessageId, // This should be the actual conversation_id
          sender_id: user.id,
          content: replyContent,
          message_type: 'text'
        })
        .select()
        .single();

      if (replyError) throw replyError;

      // Then create the thread relationship
      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          parent_message_id: parentMessageId,
          reply_message_id: replyMessage.id
        })
        .select()
        .single();

      if (threadError) throw threadError;

      setThreads(prev => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), threadData]
      }));

      return replyMessage;
    } catch (error) {
      console.error('Error sending thread reply:', error);
      throw error;
    }
  }, [user]);

  const fetchThreads = useCallback(async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq('parent_message_id', messageId);

      if (error) throw error;

      setThreads(prev => ({
        ...prev,
        [messageId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  }, []);

  return {
    threads,
    getThreadCount,
    sendThreadReply,
    fetchThreads
  };
};
