
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data.map(fav => fav.listing_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, listing_id: listingId }]);

      if (error) throw error;

      setFavorites(prev => [...prev, listingId]);
      toast({
        title: "Added to favorites",
        description: "This listing has been saved to your favorites.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (listingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== listingId));
      toast({
        title: "Removed from favorites",
        description: "This listing has been removed from your favorites.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (listingId: string) => {
    if (favorites.includes(listingId)) {
      await removeFromFavorites(listingId);
    } else {
      await addToFavorites(listingId);
    }
  };

  // Check if listing is favorited
  const isFavorited = (listingId: string) => {
    return favorites.includes(listingId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    refreshFavorites: fetchFavorites,
  };
};
