
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  breed?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  verified?: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  notify_new_matches: boolean;
  created_at: string;
}

export const useAdvancedSearch = () => {
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchListings = useCallback(async (query: string, filters: SearchFilters = {}) => {
    try {
      setLoading(true);

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
            total_reviews,
            avatar_url
          ),
          listing_photos (
            photo_url,
            display_order
          )
        `)
        .eq('status', 'active');

      // Apply text search
      if (query) {
        queryBuilder = queryBuilder.or(`dog_name.ilike.%${query}%,breed.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (filters.breed) {
        queryBuilder = queryBuilder.ilike('breed', `%${filters.breed}%`);
      }
      if (filters.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }
      if (filters.minPrice) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }
      if (filters.minAge) {
        queryBuilder = queryBuilder.gte('age', filters.minAge);
      }
      if (filters.maxAge) {
        queryBuilder = queryBuilder.lte('age', filters.maxAge);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by verified status if requested
      let results = data || [];
      if (filters.verified !== undefined) {
        results = results.filter(listing => listing.profiles?.verified === filters.verified);
      }

      return results;
    } catch (error) {
      console.error('Error searching listings:', error);
      toast({
        title: "Error",
        description: "Failed to search listings",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveSearch = async (name: string, filters: SearchFilters, notifyNewMatches: boolean = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save searches",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{
          user_id: user.id,
          name,
          filters,
          notify_new_matches: notifyNewMatches
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Search saved successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      });
      return null;
    }
  };

  const getSavedSearches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const deleteSavedSearch = async (searchId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      
      toast({
        title: "Success",
        description: "Saved search deleted",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting saved search:', error);
      toast({
        title: "Error",
        description: "Failed to delete saved search",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    searchListings,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    savedSearches,
    loading
  };
};
