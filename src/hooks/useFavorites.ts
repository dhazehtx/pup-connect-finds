
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const fetchFavorites = async () => {
    if (!user) return;

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

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          listing_id: listingId
        }]);

      if (error) throw error;

      setFavoriteListingIds(prev => new Set([...prev, listingId]));
      fetchFavorites(); // Refresh to get the full listing data
      
      toast({
        title: "Added to favorites!",
        description: "This listing has been saved to your wishlist.",
      });

      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
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

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;

      setFavoriteListingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
      
      setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));

      toast({
        title: "Removed from favorites",
        description: "This listing has been removed from your wishlist.",
      });

      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
      return false;
    }
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
    refreshFavorites: fetchFavorites
  };
};
