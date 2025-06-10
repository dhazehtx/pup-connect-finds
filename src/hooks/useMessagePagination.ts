
import { useState, useEffect } from 'react';
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
}

interface UseMessagePaginationProps {
  conversationId: string;
  pageSize?: number;
}

export const useMessagePagination = ({ 
  conversationId, 
  pageSize = 50 
}: UseMessagePaginationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const fetchMessages = async (pageNumber: number = 0, append: boolean = false) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1);

      if (error) throw error;

      const newMessages = (data || []).reverse();
      
      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      setHasMore(newMessages.length === pageSize);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(page + 1, true);
    }
  };

  const refresh = () => {
    setPage(0);
    fetchMessages(0, false);
  };

  useEffect(() => {
    if (conversationId) {
      refresh();
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    refresh,
    addMessage: (message: Message) => {
      setMessages(prev => [...prev, message]);
    }
  };
};
