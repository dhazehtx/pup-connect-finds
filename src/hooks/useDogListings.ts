
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
  updated_at: string;
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

export const useDogListings = () => {
  const [listings, setListings] = useState<DogListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all active listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            username,
            location,
            verified,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's own listings
  const getUserListings = async (userId: string): Promise<DogListing[]> => {
    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user listings:', error);
      throw error;
    }
  };

  // Create new listing
  const createListing = async (listingData: CreateListingData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
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
        title: "Success!",
        description: "Your dog listing has been created successfully",
      });

      // Refresh listings to show the new one
      await fetchListings();

      return data;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update listing
  const updateListing = async (listingId: string, updates: Partial<CreateListingData>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update listings",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .update(updates)
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your listing has been updated",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete listing
  const deleteListing = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete listings",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('dog_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your listing has been deleted",
      });
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search listings
  const searchListings = async (query: string, filters: any = {}) => {
    try {
      setLoading(true);
      let queryBuilder = supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            username,
            location,
            verified,
            avatar_url
          )
        `)
        .eq('status', 'active');

      if (query) {
        queryBuilder = queryBuilder.or(`dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (filters.breed) {
        queryBuilder = queryBuilder.eq('breed', filters.breed);
      }

      if (filters.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      if (filters.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }

      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setListings(data || []);
      return data || [];
    } catch (error) {
      console.error('Error searching listings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    fetchListings,
    getUserListings,
    createListing,
    updateListing,
    deleteListing,
    searchListings
  };
};
