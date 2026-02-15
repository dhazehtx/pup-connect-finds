
import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  buyer_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  seller_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  listing?: {
    dog_name: string;
    breed: string;
    price: number;
    image_url: string | null;
  } | null;
}

export const useConversationsFetcher = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await apiRequest('/messaging/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    conversations,
    loading,
    fetchConversations,
    setConversations
  };
};
