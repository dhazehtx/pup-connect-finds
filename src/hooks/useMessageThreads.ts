
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MessageThread {
  id: string;
  parent_message_id: string;
  reply_message_id: string;
  created_at: string;
}

interface ThreadMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export const useMessageThreads = () => {
  const [threads, setThreads] = useState<Record<string, MessageThread[]>>({});
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadMessage[]>>({});

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

  const fetchThreadMessages = async (parentMessageId: string) => {
    // Mock implementation for thread messages
    const mockMessages: ThreadMessage[] = [
      {
        id: '1',
        conversation_id: 'conv_1',
        sender_id: 'user_1',
        content: 'This is a thread reply',
        created_at: new Date().toISOString(),
        sender_name: 'User 1'
      }
    ];
    
    setThreadMessages(prev => ({
      ...prev,
      [parentMessageId]: mockMessages
    }));
  };

  const getThreadCount = (messageId: string): number => {
    return threads[messageId]?.length || 0;
  };

  const sendThreadReply = async (parentMessageId: string, content: string) => {
    // Create a mock reply message first
    const replyMessage: ThreadMessage = {
      id: crypto.randomUUID(),
      conversation_id: 'conv_1',
      sender_id: 'current_user',
      content,
      created_at: new Date().toISOString(),
      sender_name: 'Current User'
    };

    // Add to thread messages
    setThreadMessages(prev => ({
      ...prev,
      [parentMessageId]: [...(prev[parentMessageId] || []), replyMessage]
    }));

    // Create thread relationship
    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        parent_message_id: parentMessageId,
        reply_message_id: replyMessage.id
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
    threads: threadMessages,
    fetchThreads,
    fetchThreadMessages,
    getThreadCount,
    sendThreadReply
  };
};
