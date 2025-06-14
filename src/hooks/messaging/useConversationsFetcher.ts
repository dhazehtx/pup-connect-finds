
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer_profile:profiles!conversations_buyer_id_profiles_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          seller_profile:profiles!conversations_seller_id_profiles_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          listing:dog_listings!conversations_listing_id_dog_listings_id_fkey (
            dog_name,
            breed,
            price,
            image_url
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      const processedData = (data || []).map(conv => ({
        ...conv,
        buyer_profile: Array.isArray(conv.buyer_profile) ? conv.buyer_profile[0] : conv.buyer_profile,
        seller_profile: Array.isArray(conv.seller_profile) ? conv.seller_profile[0] : conv.seller_profile,
        listing: Array.isArray(conv.listing) ? conv.listing[0] : conv.listing
      }));
      
      setConversations(processedData);
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
