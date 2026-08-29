
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiRequest(`/api/favorites/${user.id}`);
      const listings = Array.isArray(data) ? data : [];
      const mapped: Favorite[] = listings.map((listing: any) => ({
        id: listing.id,
        user_id: user.id,
        listing_id: listing.id,
        // The favorite's own save time (favorited_at), NOT the listing's created_at.
        created_at: listing.favorited_at || listing.created_at || new Date().toISOString(),
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

  const addToFavorites = async (listingId: string) => {
    if (!user) return false;

    setFavoriteListingIds(prev => new Set(prev).add(listingId));

    try {
      await apiRequest('/api/favorites', {
        method: 'POST',
        body: { user_id: user.id, listing_id: listingId },
      });
      toast({
        title: "Added to favorites!",
        description: "Listing added to your favorites",
      });
      return true;
    } catch (error) {
      setFavoriteListingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromFavorites = async (listingId: string) => {
    if (!user) return false;

    setFavoriteListingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(listingId);
      return newSet;
    });

    try {
      await apiRequest(`/api/favorites/${user.id}/${listingId}`, {
        method: 'DELETE',
      });
      toast({
        title: "Removed from favorites",
        description: "Listing removed from your favorites",
      });
      return true;
    } catch (error) {
      setFavoriteListingIds(prev => new Set(prev).add(listingId));
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (toggleLoading.has(listingId)) return false;
    setToggleLoading(prev => new Set(prev).add(listingId));
    try {
      if (favoriteListingIds.has(listingId)) {
        return await removeFromFavorites(listingId);
      } else {
        return await addToFavorites(listingId);
      }
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const isFavorited = (listingId: string) => {
    return favoriteListingIds.has(listingId);
  };

  const isFavoritePending = (listingId: string) => {
    return toggleLoading.has(listingId);
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

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
