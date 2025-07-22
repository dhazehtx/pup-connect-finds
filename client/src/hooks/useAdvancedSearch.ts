
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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

      setSearchResults(results);
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

  const performSearch = useCallback(async (filters: SearchFilters) => {
    return await searchListings('', filters);
  }, [searchListings]);

  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query) return;

    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .select('breed, dog_name, location')
        .or(`breed.ilike.%${query}%,dog_name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;

      const suggestionSet = new Set<string>();
      data?.forEach(item => {
        if (item.breed?.toLowerCase().includes(query.toLowerCase())) {
          suggestionSet.add(item.breed);
        }
        if (item.dog_name?.toLowerCase().includes(query.toLowerCase())) {
          suggestionSet.add(item.dog_name);
        }
        if (item.location?.toLowerCase().includes(query.toLowerCase())) {
          suggestionSet.add(item.location);
        }
      });

      setSuggestions(Array.from(suggestionSet).slice(0, 5));
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);

  // Simplified save search without database storage for now
  const saveSearch = async (name: string, filters: SearchFilters, notifyNewMatches: boolean = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save searches",
        variant: "destructive",
      });
      return null;
    }

    // For now, just store in local state
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      notify_new_matches: notifyNewMatches,
      created_at: new Date().toISOString()
    };

    setSavedSearches(prev => [...prev, newSavedSearch]);

    toast({
      title: "Success",
      description: "Search saved successfully",
    });

    return newSavedSearch;
  };

  const getSavedSearches = async () => {
    // For now, return empty array since we're not storing in database yet
    return;
  };

  const deleteSavedSearch = async (searchId: string) => {
    if (!user) return false;

    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    
    toast({
      title: "Success",
      description: "Saved search deleted",
    });

    return true;
  };

  return {
    searchListings,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    savedSearches,
    searchResults,
    suggestions,
    performSearch,
    getSearchSuggestions,
    loading
  };
};
