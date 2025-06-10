
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ThreadMessage {
  id: string;
  parent_message_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export const useMessageThreads = () => {
  const [threads, setThreads] = useState<Record<string, ThreadMessage[]>>({});
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchThreadMessages = useCallback(async (parentMessageId: string) => {
    try {
      // For now, return empty array since we don't have thread_messages table
      const formattedMessages: ThreadMessage[] = [];

      setThreads(prev => ({
        ...prev,
        [parentMessageId]: formattedMessages
      }));

      return formattedMessages;
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      toast({
        title: "Error",
        description: "Failed to load thread messages",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const sendThreadReply = useCallback(async (
    parentMessageId: string, 
    content: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply to messages",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, create a regular message that references the parent
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: parentMessageId, // Using conversation_id as placeholder
          sender_id: user.id,
          content: `Reply: ${content}`,
          message_type: 'thread_reply'
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedMessage: ThreadMessage = {
        id: data.id,
        parent_message_id: parentMessageId,
        sender_id: data.sender_id,
        content: data.content || '',
        created_at: data.created_at,
        sender_name: user.email?.split('@')[0] || 'Unknown User'
      };

      // Update local thread state
      setThreads(prev => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), formattedMessage]
      }));

      // Update thread count
      setThreadCounts(prev => ({
        ...prev,
        [parentMessageId]: (prev[parentMessageId] || 0) + 1
      }));

      return formattedMessage;
    } catch (error) {
      console.error('Error sending thread reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  const getThreadCount = useCallback((messageId: string) => {
    return threadCounts[messageId] || 0;
  }, [threadCounts]);

  const fetchThreadCounts = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      // For now, just return empty counts since we don't have real thread structure yet
      const counts = messageIds.reduce((acc, id) => {
        acc[id] = 0;
        return acc;
      }, {} as Record<string, number>);

      setThreadCounts(prev => ({ ...prev, ...counts }));
    } catch (error) {
      console.error('Error fetching thread counts:', error);
    }
  }, []);

  return {
    threads,
    threadCounts,
    fetchThreadMessages,
    sendThreadReply,
    getThreadCount,
    fetchThreadCounts
  };
};
