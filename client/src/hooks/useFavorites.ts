
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeFavorites } from '@/hooks/useRealtime';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';

interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: {
    id: string;
    dog_name: string;
    breed: string;
    age: number;
    price: number;
    image_url: string | null;
    status: string;
  };
}

export const useFavorites = () => {
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: favorites,
    setData: setFavorites,
    executeOptimistic
  } = useOptimisticUpdates<Favorite>([]);

  // Set up polling for favorites with reduced frequency
  useRealtimeFavorites(async () => {
    console.log('Favorites polling triggered - fetching latest favorites');
    await fetchFavorites();
  });

  const fetchFavorites = async () => {
    if (!user) return;

    console.log('Fetching favorites for user:', user.id);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          dog_listings:listing_id (
            id,
            dog_name,
            breed,
            age,
            price,
            image_url,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedFavorites = data?.map(fav => ({
        ...fav,
        listing: fav.dog_listings
      })) || [];

      setFavorites(mappedFavorites);
      
      const listingIds = new Set(data?.map(fav => fav.listing_id) || []);
      setFavoriteListingIds(listingIds);
      console.log('Favorites fetched successfully, count:', mappedFavorites.length);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (listingId: string) => {
    if (!user) return false;
    
    await executeOptimistic({
      optimisticUpdate: (currentData) => {
        // Add optimistic favorite
        setFavoriteListingIds(prev => new Set([...prev, listingId]));
        const newFavorite: Favorite = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          listing_id: listingId,
          created_at: new Date().toISOString(),
        };
        return [newFavorite, ...currentData];
      },
      operation: async () => {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            listing_id: listingId
          }]);
        if (error) throw error;
      },
      rollback: (currentData) => {
        setFavoriteListingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        return currentData.filter(fav => fav.listing_id !== listingId || !fav.id.startsWith('temp-'));
      }
    });

    toast({
      title: "Added to favorites!",
      description: "Listing added to your favorites",
    });

    return true;
  };

  const removeFromFavorites = async (listingId: string) => {
    if (!user) return false;
    
    await executeOptimistic({
      optimisticUpdate: (currentData) => {
        // Remove optimistic favorite
        setFavoriteListingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        return currentData.filter(fav => fav.listing_id !== listingId);
      },
      operation: async () => {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        if (error) throw error;
      },
      rollback: (currentData) => {
        setFavoriteListingIds(prev => new Set([...prev, listingId]));
        // In a real app, we'd restore the favorite from cache or refetch
        return currentData;
      }
    });

    toast({
      title: "Removed from favorites",
      description: "Listing removed from your favorites",
    });

    return true;
  };

  const toggleFavorite = async (listingId: string) => {
    if (favoriteListingIds.has(listingId)) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  };

  const isFavorited = (listingId: string) => {
    return favoriteListingIds.has(listingId);
  };

  const isFavoritePending = (listingId: string) => {
    // For now, return false since we don't have pending state tracking
    return false;
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    isFavoritePending,
    refreshFavorites: fetchFavorites
  };
};
