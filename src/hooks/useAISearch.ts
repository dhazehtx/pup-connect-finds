
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AISearchFilters {
  query: string;
  breeds?: string[];
  priceRange?: [number, number];
  ageRange?: [number, number];
  location?: string;
  radius?: number;
  size?: string[];
  temperament?: string[];
  healthStatus?: string[];
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  withPhotos?: boolean;
  training?: string[];
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  sortBy?: 'relevance' | 'price' | 'age' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  relevance_score: number;
  listing: any;
  distance?: number;
  reasons: string[];
}

interface SavedSearch {
  id: string;
  name: string;
  filters: AISearchFilters;
  notify_on_new_matches: boolean;
  created_at: string;
  last_run_at?: string;
  match_count: number;
}

export const useAISearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchSuggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const performAISearch = useCallback(async (filters: AISearchFilters, page = 1, limit = 20) => {
    setLoading(true);
    try {
      // Call our AI search edge function
      const { data, error } = await supabase.functions.invoke('ai-search-recommendations', {
        body: {
          query: filters.query,
          userId: user?.id,
          preferences: {
            breeds: filters.breeds,
            priceRange: filters.priceRange,
            location: filters.location,
            temperament: filters.temperament
          },
          filters: {
            ...filters,
            page,
            limit
          }
        }
      });

      if (error) throw error;

      const results = data.results || [];
      setSearchResults(results);
      setTotalResults(data.totalCount || 0);
      
      // Track search for analytics
      if (user) {
        await trackSearchAnalytics(filters, results.length);
      }

      return results;
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform AI search. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get suggestions from multiple sources
      const [breedSuggestions, locationSuggestions] = await Promise.all([
        getBreedSuggestions(query),
        getLocationSuggestions(query)
      ]);

      const allSuggestions = [
        ...breedSuggestions,
        ...locationSuggestions,
        // Add AI-generated query suggestions
        `Find ${query} puppies near me`,
        `${query} puppies under $2000`,
        `Family-friendly ${query}`,
      ].filter((suggestion, index, self) => 
        self.indexOf(suggestion) === index
      ).slice(0, 8);

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);

  const getBreedSuggestions = async (query: string) => {
    const { data } = await supabase
      .from('dog_listings')
      .select('breed')
      .ilike('breed', `%${query}%`)
      .limit(5);

    return data?.map(item => item.breed).filter(Boolean) || [];
  };

  const getLocationSuggestions = async (query: string) => {
    const { data } = await supabase
      .from('dog_listings')
      .select('location')
      .ilike('location', `%${query}%`)
      .limit(5);

    return data?.map(item => item.location).filter(Boolean) || [];
  };

  const saveSearch = useCallback(async (name: string, filters: AISearchFilters, notifyOnNewMatches = true) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save searches",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          filters,
          notify_new_matches: notifyOnNewMatches
        })
        .select()
        .single();

      if (error) throw error;

      const newSavedSearch: SavedSearch = {
        id: data.id,
        name,
        filters,
        notify_on_new_matches: notifyOnNewMatches,
        created_at: data.created_at,
        match_count: searchResults.length
      };

      setSavedSearches(prev => [...prev, newSavedSearch]);
      
      toast({
        title: "Search Saved",
        description: `"${name}" has been saved to your searches`,
      });

      return newSavedSearch;
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Save Failed",
        description: "Could not save search. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, searchResults.length, toast]);

  const loadSavedSearches = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const searches: SavedSearch[] = data.map(item => ({
        id: item.id,
        name: item.name,
        filters: item.filters as AISearchFilters,
        notify_on_new_matches: item.notify_new_matches,
        created_at: item.created_at,
        match_count: 0
      }));

      setSavedSearches(searches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, [user]);

  const deleteSavedSearch = useCallback(async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      
      toast({
        title: "Search Deleted",
        description: "Saved search has been removed",
      });
    } catch (error) {
      console.error('Error deleting search:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete search. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const trackSearchAnalytics = async (filters: AISearchFilters, resultCount: number) => {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: 'search_performed',
          event_data: {
            query: filters.query,
            filters: filters,
            result_count: resultCount,
            timestamp: new Date().toISOString()
          },
          page_url: window.location.pathname,
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        });
    } catch (error) {
      console.error('Error tracking search analytics:', error);
    }
  };

  return {
    searchResults,
    savedSearches,
    searchSuggestions,
    loading,
    totalResults,
    performAISearch,
    getSearchSuggestions,
    saveSearch,
    loadSavedSearches,
    deleteSavedSearch
  };
};
