
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SearchFilters {
  query?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  location?: string;
  locationRadius?: number;
  userType?: 'breeder' | 'shelter';
  verified?: boolean;
}

interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  notify_new_matches: boolean;
  created_at: string;
}

interface SearchResult {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  image_url?: string;
  location?: string;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    user_type: string;
    verified: boolean;
    rating: number;
    total_reviews: number;
  };
}

export const useAdvancedSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Advanced search function
  const performSearch = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            user_type,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active');

      // Apply text search
      if (filters.query) {
        query = query.or(
          `dog_name.ilike.%${filters.query}%,breed.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      // Apply breed filter
      if (filters.breed) {
        query = query.ilike('breed', `%${filters.breed}%`);
      }

      // Apply price filters
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply age filters (convert to months)
      if (filters.minAge !== undefined) {
        query = query.gte('age', filters.minAge);
      }
      if (filters.maxAge !== undefined) {
        query = query.lte('age', filters.maxAge);
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by user type and verification if specified
      let results = data || [];
      if (filters.userType) {
        results = results.filter(listing => 
          listing.profiles?.user_type === filters.userType
        );
      }
      if (filters.verified) {
        results = results.filter(listing => 
          listing.profiles?.verified === true
        );
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: breeds } = await supabase
        .from('dog_listings')
        .select('breed')
        .ilike('breed', `%${query}%`)
        .limit(5);

      const { data: names } = await supabase
        .from('dog_listings')
        .select('dog_name')
        .ilike('dog_name', `%${query}%`)
        .limit(5);

      const breedSuggestions = breeds?.map(b => b.breed) || [];
      const nameSuggestions = names?.map(n => n.dog_name) || [];
      
      const uniqueSuggestions = Array.from(new Set([...breedSuggestions, ...nameSuggestions]));
      setSuggestions(uniqueSuggestions.slice(0, 8));
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);

  // Save a search
  const saveSearch = useCallback(async (name: string, filters: SearchFilters, notifyNewMatches: boolean = false) => {
    if (!user) return;

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

      setSavedSearches(prev => [data, ...prev]);

      toast({
        title: "Search Saved",
        description: `Search "${name}" has been saved`,
      });
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
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
      console.error('Error loading saved searches:', error);
    }
  }, [user]);

  // Delete saved search
  const deleteSavedSearch = useCallback(async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      toast({
        title: "Search Deleted",
        description: "Saved search has been removed",
      });
    } catch (error) {
      console.error('Error deleting saved search:', error);
      toast({
        title: "Error",
        description: "Failed to delete saved search",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load saved searches on mount
  useEffect(() => {
    if (user) {
      loadSavedSearches();
    }
  }, [user, loadSavedSearches]);

  return {
    searchResults,
    savedSearches,
    suggestions,
    loading,
    performSearch,
    getSearchSuggestions,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearches
  };
};
