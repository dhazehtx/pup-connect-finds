
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedListing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  image_url: string | null;
  user_id: string;
  status: string;
  description: string | null;
  location: string | null;
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

export const useEnhancedListings = () => {
  const [listings, setListings] = useState<EnhancedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchListings = async (filters?: {
    status?: string;
    breed?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
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

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to only show active listings
        query = query.eq('status', 'active');
      }

      if (filters?.breed) {
        query = query.ilike('breed', `%${filters.breed}%`);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
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

  const updateListingStatus = async (listingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('dog_listings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, status, updated_at: new Date().toISOString() }
          : listing
      ));

      toast({
        title: "Success",
        description: `Listing status updated to ${status}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserListings = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

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
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      toast({
        title: "Error",
        description: "Failed to load user listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchListings = async (query: string, filters?: any) => {
    try {
      setLoading(true);
      let supabaseQuery = supabase
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
        .or(`dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      // Apply additional filters if provided
      if (filters?.breed) {
        supabaseQuery = supabaseQuery.ilike('breed', `%${filters.breed}%`);
      }

      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
      }

      if (filters?.minPrice !== undefined) {
        supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error searching listings:', error);
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
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
    updateListingStatus,
    getUserListings,
    searchListings,
    refreshListings: fetchListings
  };
};
