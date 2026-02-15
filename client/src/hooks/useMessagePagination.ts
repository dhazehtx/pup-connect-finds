
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
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
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = async (before?: string, append: boolean = false) => {
    if (!conversationId) return;

    try {
      setLoading(true);

      let url = `/messaging/conversations/${conversationId}/messages?limit=${pageSize}`;
      if (before) {
        url += `&before=${before}`;
      }

      const data = await apiRequest(url);
      const newMessages: Message[] = Array.isArray(data) ? data : [];

      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      setHasMore(newMessages.length === pageSize);

      if (newMessages.length > 0) {
        setOldestMessageId(newMessages[0].id);
      }
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
    if (!loading && hasMore && oldestMessageId) {
      fetchMessages(oldestMessageId, true);
    }
  };

  const refresh = () => {
    setOldestMessageId(null);
    fetchMessages(undefined, false);
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
