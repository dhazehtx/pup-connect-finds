
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ExtendedConversation } from '@/types/messaging';
import { apiRequest } from '@/lib/api';

export const useRealtimeConversations = () => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const data = await apiRequest('/messaging/conversations');
      
      const formattedConversations = (Array.isArray(data) ? data : []).map((conv: any) => ({
        id: conv.id,
        listing_id: conv.listing_id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message_at: conv.last_message_at,
        listing: conv.listing ? {
          id: conv.listing_id || '',
          dog_name: conv.listing.dog_name,
          breed: conv.listing.breed,
          image_url: conv.listing.image_url
        } : undefined,
        other_user: conv.other_user ? {
          id: conv.other_user.id,
          full_name: conv.other_user.full_name || '',
          username: conv.other_user.username,
          avatar_url: conv.other_user.avatar_url
        } : undefined,
        unread_count: conv.unread_count || 0
      } as ExtendedConversation));

      setConversations(formattedConversations);
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

  const createConversation = useCallback(async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      const result = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: {
          listing_id: listingId,
          seller_id: sellerId
        }
      });

      await fetchConversations();
      return result?.id || null;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, fetchConversations, toast]);

  return {
    conversations,
    loading,
    setLoading,
    fetchConversations,
    createConversation
  };
};
