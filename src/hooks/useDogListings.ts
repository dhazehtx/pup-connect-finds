
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DogListing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description?: string;
  location?: string;
  image_url?: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    full_name: string;
    username: string;
    verified: boolean;
    location?: string;
    rating?: number;
    total_reviews?: number;
  };
}

export const useDogListings = () => {
  const [listings, setListings] = useState<DogListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState<DogListing[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all public listings
  const fetchListings = async (filters?: any) => {
    try {
      setLoading(true);
      let query = supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            username,
            verified,
            location,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.breed) {
          query = query.ilike('breed', `%${filters.breed}%`);
        }
        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
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

  // Fetch user's own listings
  const fetchUserListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            username,
            verified
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new listing
  const createListing = async (listingData: Omit<DogListing, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'profiles'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .insert([{
          ...listingData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your listing has been created successfully!",
      });

      // Refresh listings
      fetchUserListings();
      fetchListings();
      return data;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update listing
  const updateListing = async (listingId: string, updates: Partial<DogListing>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .update(updates)
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });

      fetchUserListings();
      return data;
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete listing
  const deleteListing = async (listingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('dog_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });

      fetchUserListings();
      return true;
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user]);

  return {
    listings,
    userListings,
    loading,
    fetchListings,
    fetchUserListings,
    createListing,
    updateListing,
    deleteListing,
    refreshListings: fetchListings
  };
};
