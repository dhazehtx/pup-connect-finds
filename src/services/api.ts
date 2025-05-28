
import { supabase } from '@/integrations/supabase/client';
import { DogListing, User, Review, Message, Favorite, Report } from '@/types/backend';

// User Service
export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async searchUsers(query: string, userType?: string): Promise<User[]> {
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%, username.ilike.%${query}%`);
    
    if (userType) {
      queryBuilder = queryBuilder.eq('user_type', userType);
    }
    
    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
  }
};

// Listing Service
export const listingService = {
  async createListing(listing: Omit<DogListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<DogListing> {
    const { data, error } = await supabase
      .from('dog_listings')
      .insert([listing])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getListings(filters?: {
    breed?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    status?: string;
  }): Promise<DogListing[]> {
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

    if (filters?.breed) {
      query = query.eq('breed', filters.breed);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getUserListings(userId: string): Promise<DogListing[]> {
    const { data, error } = await supabase
      .from('dog_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateListing(listingId: string, updates: Partial<DogListing>): Promise<DogListing> {
    const { data, error } = await supabase
      .from('dog_listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteListing(listingId: string): Promise<void> {
    const { error } = await supabase
      .from('dog_listings')
      .delete()
      .eq('id', listingId);
    
    if (error) throw error;
  }
};

// Analytics Service
export const analyticsService = {
  async trackListingView(listingId: string, userId?: string): Promise<void> {
    // Implementation for tracking listing views
    console.log('Tracking view for listing:', listingId, 'by user:', userId);
  },

  async getListingAnalytics(listingId: string): Promise<{
    views: number;
    inquiries: number;
    favorites: number;
  }> {
    // Implementation for getting listing analytics
    return { views: 0, inquiries: 0, favorites: 0 };
  },

  async getUserAnalytics(userId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
  }> {
    // Implementation for getting user analytics
    return { totalListings: 0, activeListings: 0, totalViews: 0, totalInquiries: 0 };
  }
};

// Search Service
export const searchService = {
  async searchListings(query: string, filters?: {
    breed?: string;
    location?: string;
    priceRange?: [number, number];
  }): Promise<DogListing[]> {
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
      .or(`dog_name.ilike.%${query}%, breed.ilike.%${query}%`);

    if (filters?.breed) {
      queryBuilder = queryBuilder.eq('breed', filters.breed);
    }
    if (filters?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
  }
};
