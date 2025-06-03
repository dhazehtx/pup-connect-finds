
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

interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  timestamp: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface Filters {
  searchTerm?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  age?: string;
  status?: string;
}

export const useEnhancedListings = () => {
  const [listings, setListings] = useState<EnhancedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<Filters>({});
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [enhancedListings, setEnhancedListings] = useState<EnhancedListing[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchListings = async (customFilters?: Filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const activeFilters = customFilters || filters;
      
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
        `, { count: 'exact' })
        .eq('status', 'active')
        .order(sortConfig.field, { ascending: sortConfig.direction === 'asc' })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (activeFilters.searchTerm) {
        query = query.or(`dog_name.ilike.%${activeFilters.searchTerm}%,breed.ilike.%${activeFilters.searchTerm}%,description.ilike.%${activeFilters.searchTerm}%`);
      }

      if (activeFilters.breed) {
        query = query.ilike('breed', `%${activeFilters.breed}%`);
      }

      if (activeFilters.location) {
        query = query.ilike('location', `%${activeFilters.location}%`);
      }

      if (activeFilters.minPrice !== undefined) {
        query = query.gte('price', activeFilters.minPrice);
      }

      if (activeFilters.maxPrice !== undefined) {
        query = query.lte('price', activeFilters.maxPrice);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      setListings(data || []);
      setEnhancedListings(data || []);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings');
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

  const searchListings = async (query: string, customFilters?: any) => {
    const newFilters = { ...filters, searchTerm: query, ...customFilters };
    setFilters(newFilters);
    await fetchListings(newFilters);
  };

  // Search history functions
  const addSearchToHistory = (query: string) => {
    const newSearch: SearchHistory = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString()
    };
    setSearchHistory(prev => [newSearch, ...prev.slice(0, 9)]); // Keep last 10 searches
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // Saved searches functions
  const saveSearch = (name: string, searchFilters: Filters) => {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters: searchFilters,
      timestamp: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, newSavedSearch]);
    toast({
      title: "Search Saved",
      description: `Search "${name}" has been saved`,
    });
  };

  const deleteSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    toast({
      title: "Search Deleted",
      description: "Saved search has been removed",
    });
  };

  const applySavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    fetchListings(search.filters);
  };

  const clearAllFilters = () => {
    const emptyFilters: Filters = {};
    setFilters(emptyFilters);
    setQuickFilter('');
    fetchListings(emptyFilters);
  };

  // Favorites functions
  const favoriteListing = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to favorite listings",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorited = favorites.includes(listingId);
      
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        
        setFavorites(prev => prev.filter(id => id !== listingId));
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });
        
        setFavorites(prev => [...prev, listingId]);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    }
  };

  const isListingFavorited = (listingId: string) => {
    return favorites.includes(listingId);
  };

  // Analytics functions
  const trackListingView = async (listingId: string) => {
    try {
      await supabase.from('user_interactions').insert({
        user_id: user?.id,
        target_id: listingId,
        target_type: 'listing',
        interaction_type: 'view',
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to track listing view:', error);
    }
  };

  const trackListingInquiry = async (listingId: string) => {
    try {
      await supabase.from('user_interactions').insert({
        user_id: user?.id,
        target_id: listingId,
        target_type: 'listing',
        interaction_type: 'inquiry',
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to track listing inquiry:', error);
    }
  };

  // Load favorites on mount
  useEffect(() => {
    if (user) {
      const loadFavorites = async () => {
        try {
          const { data } = await supabase
            .from('favorites')
            .select('listing_id')
            .eq('user_id', user.id);
          
          setFavorites(data?.map(f => f.listing_id) || []);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      };
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [page, pageSize, sortConfig]);

  return {
    listings,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortConfig,
    setSortConfig,
    filters,
    setFilters,
    searchHistory,
    addSearchToHistory,
    clearSearchHistory,
    savedSearches,
    saveSearch,
    deleteSearch,
    applySavedSearch,
    clearAllFilters,
    quickFilter,
    setQuickFilter,
    enhancedListings,
    favoriteListing,
    isListingFavorited,
    trackListingView,
    trackListingInquiry,
    fetchListings,
    updateListingStatus,
    getUserListings,
    searchListings,
    refreshListings: fetchListings
  };
};
