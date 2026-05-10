
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
    price?: number;
  };
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified_breeder?: boolean;
  };
  unread_count?: number;
}

export const useConversationsManager = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest('/messaging/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      const conv = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: sellerId, listing_id: listingId }
      });

      await fetchConversations();
      return conv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
};
