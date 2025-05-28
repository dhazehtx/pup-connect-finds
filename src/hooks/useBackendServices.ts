
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userService, listingService, analyticsService, searchService } from '@/services/api';
import { DogListing, User } from '@/types/backend';

// Enhanced user management hook
export const useUserProfile = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      const userData = await userService.getProfile(id);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!userId) return;
    
    try {
      const updatedUser = await userService.updateProfile(userId, updates);
      setUser(updatedUser);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  return { user, loading, updateUser, refetch: () => userId && fetchUser(userId) };
};

// Enhanced listing management hook
export const useListingManagement = () => {
  const [listings, setListings] = useState<DogListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchListings = async (filters?: any) => {
    try {
      setLoading(true);
      const data = await listingService.getListings(filters);
      setListings(data);
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

  const createListing = async (listingData: Omit<DogListing, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newListing = await listingService.createListing(listingData);
      setListings(prev => [newListing, ...prev]);
      toast({
        title: "Success",
        description: "Listing created successfully",
      });
      return newListing;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateListing = async (listingId: string, updates: Partial<DogListing>) => {
    try {
      const updatedListing = await listingService.updateListing(listingId, updates);
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? updatedListing : listing
      ));
      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      await listingService.deleteListing(listingId);
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  return {
    listings,
    loading,
    fetchListings,
    createListing,
    updateListing,
    deleteListing
  };
};

// Search and filtering hook
export const useAdvancedSearch = () => {
  const [searchResults, setSearchResults] = useState<DogListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const search = async (query: string, filters?: any) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchService.searchListings(query, filters);
      setSearchResults(results);
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

  return { searchResults, loading, search };
};

// Analytics hook
export const useAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await analyticsService.getUserAnalytics(userId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  return { analytics, loading, refetch: fetchAnalytics };
};
