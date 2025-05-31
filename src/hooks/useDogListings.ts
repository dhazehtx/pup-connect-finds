
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/enhanced-toast';

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
        .eq('status', 'active')
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

  const createListing = async (listingData: Omit<DogListing, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('dog_listings')
        .insert([{ 
          ...listingData, 
          user_id: user.id,
          status: listingData.status || 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      showSuccessToast({
        title: 'Listing created successfully',
        description: 'Your puppy listing is now live and visible to potential buyers.'
      });

      fetchListings();
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
      const { error } = await supabase
        .from('dog_listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showSuccessToast({
        title: 'Listing updated successfully',
        description: 'Your changes have been saved and are now visible.'
      });

      fetchListings();
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

      showSuccessToast({
        title: 'Listing deleted successfully',
        description: 'Your listing has been removed from the platform.'
      });

      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      showErrorToast({
        title: 'Failed to delete listing',
        description: 'Please try again or contact support if the problem persists.'
      });
      throw error;
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
    refreshListings: fetchListings,
  };
};
