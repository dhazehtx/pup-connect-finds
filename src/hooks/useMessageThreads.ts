
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ThreadMessage {
  id: string;
  parent_message_id: string;
  reply_message_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
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
      const { data: replyMessage, error: replyError } = await supabase
        .from('messages')
        .insert({
          conversation_id: parentMessageId,
          sender_id: user.id,
          content: replyContent,
          message_type: 'text'
        })
        .select()
        .single();

      if (replyError) throw replyError;

      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          parent_message_id: parentMessageId,
          reply_message_id: replyMessage.id
        })
        .select()
        .single();

      if (threadError) throw threadError;

      const threadMessage: ThreadMessage = {
        id: replyMessage.id,
        parent_message_id: parentMessageId,
        reply_message_id: replyMessage.id,
        content: replyContent,
        sender_id: user.id,
        sender_name: user.email || 'Anonymous',
        created_at: replyMessage.created_at
      };

      setThreads(prev => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), threadMessage]
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

  const fetchThreadMessages = useCallback(async (parentMessageId: string) => {
    try {
      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .select(`
          *,
          messages:reply_message_id (
            id,
            content,
            sender_id,
            created_at,
            profiles:sender_id (
              username,
              full_name
            )
          )
        `)
        .eq('parent_message_id', parentMessageId);

      if (threadError) throw threadError;

      const threadMessages: ThreadMessage[] = (threadData || []).map((thread: any) => ({
        id: thread.messages.id,
        parent_message_id: parentMessageId,
        reply_message_id: thread.reply_message_id,
        content: thread.messages.content,
        sender_id: thread.messages.sender_id,
        sender_name: thread.messages.profiles?.full_name || thread.messages.profiles?.username || 'Unknown',
        created_at: thread.messages.created_at
      }));

      setThreads(prev => ({
        ...prev,
        [parentMessageId]: threadMessages
      }));
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  }, []);

  return {
    threads,
    getThreadCount,
    sendThreadReply,
    fetchThreads,
    fetchThreadMessages
  };
};
