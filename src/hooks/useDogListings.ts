
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location?: string;
  image_url?: string;
  status: string;
  created_at: string;
  user_id: string;
}

export const useDogListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserListings(data || []);
    } catch (error: any) {
      console.error('Error fetching user listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('dog_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user?.id); // Security check

      if (error) throw error;

      setUserListings(prev => prev.filter(listing => listing.id !== listingId));
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed successfully",
      });
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  return {
    userListings,
    loading,
    fetchUserListings,
    deleteListing,
  };
};
