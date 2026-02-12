
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:dog_listings!conversations_listing_id_dog_listings_id_fkey (
            dog_name,
            breed,
            image_url,
            price
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationsError) throw conversationsError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Batch fetch all other user IDs to minimize queries
      const otherUserIds = conversationsData.map(conv => 
        conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
      );
      
      // Fetch all profiles at once
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', otherUserIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      const unreadCountMap = new Map<string, number>();
      conversationsData.forEach(conv => {
        unreadCountMap.set(conv.id, 0);
      });

      const convIds = conversationsData.map(c => c.id);
      if (convIds.length > 0) {
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('read', false)
          .neq('sender_id', user.id);

        if (unreadMessages) {
          for (const msg of unreadMessages) {
            const prev = unreadCountMap.get(msg.conversation_id) || 0;
            unreadCountMap.set(msg.conversation_id, prev + 1);
          }
        }
      }

      const conversationsWithProfiles = conversationsData.map((conv) => {
        const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        const profileData = profilesMap.get(otherUserId);

        return {
          ...conv,
          listing: Array.isArray(conv.listing) ? conv.listing[0] : conv.listing,
          other_user: profileData ? {
            full_name: profileData.full_name,
            username: profileData.username,
            avatar_url: profileData.avatar_url
          } : {
            full_name: null,
            username: null,
            avatar_url: null
          },
          unread_count: unreadCountMap.get(conv.id) || 0
        };
      });

      // For signed-in users: only show real conversations, no demo data
      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      
      // For signed-in users: show empty state, no demo data on error
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists (bidirectional - user can be buyer or seller)
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId
        }])
        .select()
        .single();

      if (error) throw error;

      // Send initial message about the listing
      const { data: listingData } = await supabase
        .from('dog_listings')
        .select('dog_name, breed')
        .eq('id', listingId)
        .single();

      if (listingData) {
        const initialMessage = `Hi! I'm interested in ${listingData.dog_name} (${listingData.breed}). Could you tell me more about this puppy?`;
        
        await supabase
          .from('messages')
          .insert([{
            conversation_id: data.id,
            sender_id: user.id,
            content: initialMessage,
            message_type: 'text'
          }]);
      }

      await fetchConversations();
      return data.id;
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${user.id},seller_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
};
