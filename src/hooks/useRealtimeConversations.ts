
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ExtendedConversation } from '@/types/messaging';

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
          listing:dog_listings(dog_name, breed, image_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Fetch profiles separately to avoid relationship issues
      const userIds = new Set<string>();
      (data || []).forEach(conv => {
        if (conv.buyer_id !== user.id) userIds.add(conv.buyer_id);
        if (conv.seller_id !== user.id) userIds.add(conv.seller_id);
      });

      let profilesMap = new Map();
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', Array.from(userIds));

        profiles?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Transform data to include other_user based on current user's role
      const transformedData: ExtendedConversation[] = (data || []).map(conv => ({
        id: conv.id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        listing_id: conv.listing_id,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        listing: conv.listing ? {
          dog_name: conv.listing.dog_name,
          breed: conv.listing.breed,
          image_url: conv.listing.image_url
        } : undefined,
        other_user: (() => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          const profile = profilesMap.get(otherUserId);
          return profile ? {
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url
          } : undefined;
        })()
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
