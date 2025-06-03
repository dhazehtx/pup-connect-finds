
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DogListing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  image_url?: string;
  user_id: string;
  status?: string;
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    username: string;
    location: string;
    verified: boolean;
    rating: number;
    total_reviews: number;
  };
}

export const useDogListings = () => {
  const [listings, setListings] = useState<DogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      showErrorToast({
        title: 'Failed to load listings',
        description: 'Please try refreshing the page or check your connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserListings = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user listings:', error);
      return [];
    }
  };

  const createListing = async (listingData: Omit<DogListing, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('dog_listings')
        .insert([{ 
          ...listingData, 
          user_id: currentUser.id,
          status: listingData.status || 'active'
        }])
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .single();

      if (error) throw error;

      // Add to local state
      setListings(prev => [data, ...prev]);

      showSuccessToast({
        title: 'Listing created successfully',
        description: 'Your puppy listing is now live and visible to potential buyers.'
      });

      return data;
    } catch (error) {
      console.error('Error creating listing:', error);
      showErrorToast({
        title: 'Failed to create listing',
        description: 'Please check your information and try again.'
      });
      throw error;
    }
  };

  const updateListing = async (id: string, updates: Partial<DogListing>) => {
    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === id ? data : listing
      ));

      showSuccessToast({
        title: 'Listing updated successfully',
        description: 'Your changes have been saved and are now visible.'
      });

      return data;
    } catch (error) {
      console.error('Error updating listing:', error);
      showErrorToast({
        title: 'Failed to update listing',
        description: 'Please try again or contact support if the problem persists.'
      });
      throw error;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dog_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== id));

      showSuccessToast({
        title: 'Listing deleted successfully',
        description: 'Your listing has been removed from the platform.'
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      showErrorToast({
        title: 'Failed to delete listing',
        description: 'Please try again or contact support if the problem persists.'
      });
      throw error;
    }
  };

  const getListingById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  };

  const searchListings = async (query: string, filters?: any) => {
    try {
      let queryBuilder = supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            location,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active');

      if (query) {
        queryBuilder = queryBuilder.or(
          `dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (filters?.breed) {
        queryBuilder = queryBuilder.ilike('breed', `%${filters.breed}%`);
      }

      if (filters?.minPrice) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      if (filters?.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching listings:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    createListing,
    updateListing,
    deleteListing,
    getListingById,
    fetchUserListings,
    searchListings,
    refreshListings: fetchListings,
  };
};
