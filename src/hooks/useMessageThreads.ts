
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThreadMessage } from '@/types/messaging';

export const useMessageThreads = () => {
  const [threads, setThreads] = useState<Record<string, ThreadMessage[]>>({});
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchThreadMessages = useCallback(async (parentMessageId: string) => {
    try {
      const { data, error } = await supabase
        .from('thread_messages')
        .select(`
          *,
          profiles:sender_id (
            full_name
          )
        `)
        .eq('parent_message_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        ...msg,
        sender_name: msg.profiles?.full_name || 'Unknown User'
      }));

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
      const { data, error } = await supabase
        .from('thread_messages')
        .insert([{
          parent_message_id: parentMessageId,
          sender_id: user.id,
          content
        }])
        .select(`
          *,
          profiles:sender_id (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      const formattedMessage = {
        ...data,
        sender_name: data.profiles?.full_name || 'Unknown User'
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
      const { data, error } = await supabase
        .from('thread_messages')
        .select('parent_message_id')
        .in('parent_message_id', messageIds);

      if (error) throw error;

      const counts = (data || []).reduce((acc, item) => {
        acc[item.parent_message_id] = (acc[item.parent_message_id] || 0) + 1;
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
