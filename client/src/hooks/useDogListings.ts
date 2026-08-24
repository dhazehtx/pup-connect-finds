
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiRequest } from '@/lib/api';
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
  images?: string[];
  videos?: string[];
  video_url?: string;
  status: string;
  listing_status?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // New enhanced fields
  gender?: 'Male' | 'Female' | 'Unknown';
  size?: 'Small' | 'Medium' | 'Large';
  color?: string;
  vaccinated?: boolean;
  neutered_spayed?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  special_needs?: boolean;
  rehoming?: boolean;
  delivery_available?: boolean;
  profiles?: {
    full_name: string;
    username: string;
    location: string;
    verified: boolean;
    avatar_url: string;
    rating?: number;
    total_reviews?: number;
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
  images?: string[];
  videos?: string[];
  video_url?: string;
  status: string;
  listing_status?: string;
  // New enhanced fields
  gender?: 'Male' | 'Female' | 'Unknown';
  size?: 'Small' | 'Medium' | 'Large';
  color?: string;
  vaccinated?: boolean;
  neutered_spayed?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  special_needs?: boolean;
  rehoming?: boolean;
  delivery_available?: boolean;
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
            avatar_url,
            rating,
            total_reviews
          )
        `)
        .in('status', ['active', 'available'])
        .in('listing_status', ['active', 'available'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data || []) as DogListing[]);
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
      return (data || []) as DogListing[];
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
      // Authoritative write path: server → Neon/Drizzle (same DB the explore feed
      // reads from), with ownership enforced server-side. No browser-direct writes.
      const data = await apiRequest('/api/listings', {
        method: 'POST',
        body: {
          ...listingData,
          listing_status: listingData.listing_status || 'active',
        },
      });

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
      // Authoritative write path: server enforces ownership (403 if not owner).
      const data = await apiRequest(`/api/listings/${listingId}`, {
        method: 'PUT',
        body: updates,
      });

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
      // Authoritative write path: server enforces ownership and soft-deletes (trash).
      await apiRequest(`/api/listings/${listingId}`, { method: 'DELETE' });

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

  // Search listings with enhanced filters
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
            avatar_url,
            rating,
            total_reviews
          )
        `)
        .in('status', ['active', 'available'])
        .in('listing_status', ['active', 'available']);

      if (query) {
        queryBuilder = queryBuilder.or(`dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (filters.breed && filters.breed !== 'All Breeds') {
        queryBuilder = queryBuilder.eq('breed', filters.breed);
      }

      if (filters.gender) {
        queryBuilder = queryBuilder.eq('gender', filters.gender);
      }

      if (filters.size) {
        queryBuilder = queryBuilder.eq('size', filters.size);
      }

      if (filters.color) {
        queryBuilder = queryBuilder.ilike('color', `%${filters.color}%`);
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

      // Boolean filters
      if (filters.vaccinated === true) {
        queryBuilder = queryBuilder.eq('vaccinated', true);
      }

      if (filters.neutered_spayed === true) {
        queryBuilder = queryBuilder.eq('neutered_spayed', true);
      }

      if (filters.good_with_kids === true) {
        queryBuilder = queryBuilder.eq('good_with_kids', true);
      }

      if (filters.good_with_dogs === true) {
        queryBuilder = queryBuilder.eq('good_with_dogs', true);
      }

      if (filters.delivery_available === true) {
        queryBuilder = queryBuilder.eq('delivery_available', true);
      }

      if (filters.rehoming === true) {
        queryBuilder = queryBuilder.eq('rehoming', true);
      }

      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error } = await queryBuilder;

      if (error) throw error;
      const typedData = (data || []) as DogListing[];
      setListings(typedData);
      return typedData;
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
