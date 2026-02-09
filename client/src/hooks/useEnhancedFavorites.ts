
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFavorite {
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
    image_url?: string;
    status: string;
    location?: string;
    user_id: string;
    profiles?: {
      full_name: string;
      username: string;
      verified: boolean;
    };
  };
}

export const useEnhancedFavorites = () => {
  const [favorites, setFavorites] = useState<EnhancedFavorite[]>([]);
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());
  const toggleLoadingRef = useRef<Set<string>>(toggleLoading);
  toggleLoadingRef.current = toggleLoading;
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:dog_listings (
            id,
            dog_name,
            breed,
            age,
            price,
            image_url,
            status,
            location,
            user_id,
            profiles:user_id (
              full_name,
              username,
              verified
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validFavorites = (data || []).filter(fav => fav.listing);
      setFavorites(validFavorites);
      
      const ids = new Set(validFavorites.map(fav => fav.listing_id));
      setFavoriteListingIds(ids);
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
  }, [user, toast]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!user) return;
    if (toggleLoading.has(listingId)) return;

    setToggleLoading(prev => new Set(prev).add(listingId));

    const isFav = favoriteListingIds.has(listingId);
    const prevFavorites = [...favorites];
    const prevIds = new Set(favoriteListingIds);

    if (isFav) {
      setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));
      setFavoriteListingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    } else {
      setFavoriteListingIds(prev => new Set(prev).add(listingId));
      const optimisticFavorite: EnhancedFavorite = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        listing_id: listingId,
        created_at: new Date().toISOString(),
      };
      setFavorites(prev => [optimisticFavorite, ...prev]);
    }

    try {
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;

        toast({
          title: "Removed from Favorites",
          description: "Listing removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .upsert(
            { user_id: user.id, listing_id: listingId },
            { onConflict: 'user_id,listing_id', ignoreDuplicates: true }
          );

        if (error && error.code !== '23505') throw error;

        toast({
          title: "Added to Favorites",
          description: "Listing added to your favorites",
        });
      }
    } catch (error: any) {
      if (error?.code === '23505') {
        setFavoriteListingIds(prev => new Set(prev).add(listingId));
      } else {
        setFavorites(prevFavorites);
        setFavoriteListingIds(prevIds);
        console.error('Error toggling favorite:', error);
        toast({
          title: "Error",
          description: "Failed to update favorites",
          variant: "destructive",
        });
      }
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  }, [user, favoriteListingIds, toggleLoading, toast, fetchFavorites]);

  // Check if listing is favorited
  const isFavorited = useCallback((listingId: string) => {
    return favoriteListingIds.has(listingId);
  }, [favoriteListingIds]);

  // Check if toggle is pending
  const isFavoritePending = useCallback((listingId: string) => {
    return toggleLoading.has(listingId);
  }, [toggleLoading]);

  // Get favorites count for a user
  const getFavoritesCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }, []);

  // Get who favorited a listing
  const getListingFavorites = useCallback(async (listingId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          user:profiles!favorites_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting listing favorites:', error);
      return [];
    }
  }, []);

  // Set up real-time subscription for favorite updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          if (toggleLoadingRef.current.size === 0) {
            fetchFavorites();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFavorites]);

  // Load favorites on mount
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited,
    isFavoritePending,
    getFavoritesCount,
    getListingFavorites,
    refreshFavorites: fetchFavorites
  };
};
