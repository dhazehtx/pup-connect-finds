
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MessageThread {
  id: string;
  parent_message_id: string;
  reply_message_id: string;
  created_at: string;
}

export const useMessageThreads = () => {
  const [threads, setThreads] = useState<Record<string, MessageThread[]>>({});

  const fetchThreads = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .in('parent_message_id', messageIds);

    if (error) {
      console.error('Error fetching threads:', error);
      return;
    }

    const threadsByMessage = data.reduce((acc, thread) => {
      if (!acc[thread.parent_message_id]) {
        acc[thread.parent_message_id] = [];
      }
      acc[thread.parent_message_id].push(thread);
      return acc;
    }, {} as Record<string, MessageThread[]>);

    setThreads(prev => ({ ...prev, ...threadsByMessage }));
  };

  const getThreadCount = (messageId: string): number => {
    return threads[messageId]?.length || 0;
  };

  const sendThreadReply = async (parentMessageId: string, replyMessageId: string) => {
    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        parent_message_id: parentMessageId,
        reply_message_id: replyMessageId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating thread reply:', error);
      return;
    }

    setThreads(prev => ({
      ...prev,
      [parentMessageId]: [...(prev[parentMessageId] || []), data]
    }));
  };

  return {
    threads,
    fetchThreads,
    getThreadCount,
    sendThreadReply
  };
};
