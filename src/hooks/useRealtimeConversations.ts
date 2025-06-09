
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ExtendedConversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useRealtimeConversations = () => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:dog_listings(dog_name, breed, image_url),
          buyer_profile:profiles!buyer_id(full_name, username, avatar_url),
          seller_profile:profiles!seller_id(full_name, username, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Transform data to include other_user based on current user's role
      const transformedData = (data || []).map(conv => ({
        ...conv,
        other_user: conv.buyer_id === user.id ? conv.seller_profile : conv.buyer_profile
      }));

      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const createConversation = useCallback(async (
    buyerId: string,
    sellerId: string,
    listingId?: string
  ) => {
    try {
      // First check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('listing_id', listingId)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          buyer_id: buyerId,
          seller_id: sellerId,
          listing_id: listingId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    conversations,
    setConversations,
    loading,
    setLoading,
    fetchConversations,
    createConversation,
  };
};
