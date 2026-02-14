
import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiRequest(`/api/favorites/${user.id}`);
      const listings = Array.isArray(data) ? data : [];
      const mapped: EnhancedFavorite[] = listings.map((listing: any) => ({
        id: listing.id,
        user_id: user.id,
        listing_id: listing.id,
        created_at: listing.created_at || new Date().toISOString(),
        listing,
      }));
      setFavorites(mapped);
      setFavoriteListingIds(new Set(listings.map((l: any) => l.id)));
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
        await apiRequest(`/api/favorites/${user.id}/${listingId}`, {
          method: 'DELETE',
        });
        toast({
          title: "Removed from Favorites",
          description: "Listing removed from your favorites",
        });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: { user_id: user.id, listing_id: listingId },
        });
        toast({
          title: "Added to Favorites",
          description: "Listing added to your favorites",
        });
      }
    } catch (error: any) {
      setFavorites(prevFavorites);
      setFavoriteListingIds(prevIds);
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  }, [user, favoriteListingIds, toggleLoading, toast, favorites]);

  const isFavorited = useCallback((listingId: string) => {
    return favoriteListingIds.has(listingId);
  }, [favoriteListingIds]);

  const isFavoritePending = useCallback((listingId: string) => {
    return toggleLoading.has(listingId);
  }, [toggleLoading]);

  const getFavoritesCount = useCallback(async (userId: string) => {
    try {
      const data = await apiRequest(`/api/favorites/${userId}`);
      return Array.isArray(data) ? data.length : 0;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }, []);

  const getListingFavorites = useCallback(async (listingId: string) => {
    try {
      const data = await apiRequest(`/api/favorites/count/${listingId}`);
      return data?.count ?? 0;
    } catch (error) {
      console.error('Error getting listing favorites:', error);
      return 0;
    }
  }, []);

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
