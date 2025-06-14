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
  profiles?: {
    full_name: string;
    verified: boolean;
    rating?: number;
  };
}

interface CreateListingData {
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description?: string;
  location?: string;
  image_url?: string;
  status: string;
}

interface UpdateListingData {
  dog_name?: string;
  breed?: string;
  age?: number;
  price?: number;
  description?: string;
  location?: string;
  image_url?: string;
  status?: string;
}

export const useDogListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchUserListings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            verified,
            rating
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const createListing = async (listingData: CreateListingData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }

    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .insert({
          ...listingData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUserListings(prev => [data, ...prev]);
      setListings(prev => [data, ...prev]);

      toast({
        title: "Success",
        description: "Listing created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateListing = async (listingId: string, updates: UpdateListingData) => {
    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .update(updates)
        .eq('id', listingId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUserListings(prev => 
        prev.map(listing => 
          listing.id === listingId ? { ...listing, ...data } : listing
        )
      );
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId ? { ...listing, ...data } : listing
        )
      );

      toast({
        title: "Success",
        description: "Listing updated successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
      throw error;
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
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      
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

  const refreshListings = async () => {
    await fetchListings();
    if (user) {
      await fetchUserListings();
    }
  };

  return {
    userListings,
    listings,
    loading,
    fetchUserListings,
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
    refreshListings,
  };
};
