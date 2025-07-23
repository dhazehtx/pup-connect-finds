
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

      const conversationsWithProfiles = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            listing: Array.isArray(conv.listing) ? conv.listing[0] : conv.listing,
            other_user: profileData || {
              full_name: null,
              username: null,
              avatar_url: null
            },
            unread_count: unreadCount || 0
          };
        })
      );

      // If no real conversations exist, show mock conversations for demo
      if (conversationsWithProfiles.length === 0) {
        const mockConversations = [
          {
            id: 'mock_conv_1',
            listing_id: 'mock_listing_1',
            buyer_id: user.id,
            seller_id: '101',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            listing: {
              dog_name: 'Buddy',
              breed: 'Golden Retriever',
              image_url: 'https://placedog.com/300/300',
              price: 1200
            },
            other_user: {
              id: '101',
              full_name: 'Austin Reyes',
              username: 'goldenbreeder',
              avatar_url: 'https://i.pravatar.cc/150?img=1'
            },
            unread_count: 2
          },
          {
            id: 'mock_conv_2',
            listing_id: 'mock_listing_2',
            buyer_id: user.id,
            seller_id: '102',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            last_message_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            listing: {
              dog_name: 'Luna',
              breed: 'Labrador',
              image_url: 'https://placedog.com/300/301',
              price: 800
            },
            other_user: {
              id: '102',
              full_name: 'Jennifer Martinez',
              username: 'labsofca',
              avatar_url: 'https://i.pravatar.cc/150?img=2'
            },
            unread_count: 0
          }
        ];
        setConversations(mockConversations);
      } else {
        setConversations(conversationsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      
      // Show mock conversations even on error for demo purposes
      const mockConversations = [
        {
          id: 'mock_conv_1',
          listing_id: 'mock_listing_1',
          buyer_id: user?.id || 'current_user',
          seller_id: '101',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          listing: {
            dog_name: 'Buddy',
            breed: 'Golden Retriever',
            image_url: 'https://placedog.com/300/300',
            price: 1200
          },
          other_user: {
            id: '101',
            full_name: 'Austin Reyes',
            username: 'goldenbreeder',
            avatar_url: 'https://i.pravatar.cc/150?img=1'
          },
          unread_count: 2
        }
      ];
      setConversations(mockConversations);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
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
