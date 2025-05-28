import { supabase } from '@/integrations/supabase/client';
import { DogListing, User, Review, Message, Favorite, Report } from '@/types/backend';

// Helper function to map database user to User interface
const mapDatabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.full_name,
    username: dbUser.username,
    userType: dbUser.user_type,
    bio: dbUser.bio,
    location: dbUser.location,
    phone: dbUser.phone,
    websiteUrl: dbUser.website_url,
    avatarUrl: dbUser.avatar_url,
    verified: dbUser.verified,
    rating: dbUser.rating,
    totalReviews: dbUser.total_reviews,
    yearsExperience: dbUser.years_experience,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
};

// Helper function to map database listing to DogListing interface
const mapDatabaseListingToDogListing = (dbListing: any): DogListing => {
  return {
    id: dbListing.id,
    dogName: dbListing.dog_name,
    breed: dbListing.breed,
    age: dbListing.age,
    price: dbListing.price,
    imageUrl: dbListing.image_url,
    userId: dbListing.user_id,
    status: 'active', // Fixed: use 'active' instead of 'available'
    createdAt: dbListing.created_at,
    updatedAt: dbListing.updated_at,
    // Include profile data if available
    ...(dbListing.profiles && {
      userProfile: mapDatabaseUserToUser(dbListing.profiles)
    })
  };
};

// Helper function to map DogListing interface to database format
const mapDogListingToDatabase = (listing: Omit<DogListing, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    dog_name: listing.dogName,
    breed: listing.breed,
    age: listing.age,
    price: listing.price,
    image_url: listing.imageUrl,
    user_id: listing.userId,
  };
};

// User Service
export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data ? mapDatabaseUserToUser(data) : null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Map User interface to database format
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.userType !== undefined) dbUpdates.user_type = updates.userType;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.websiteUrl !== undefined) dbUpdates.website_url = updates.websiteUrl;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.totalReviews !== undefined) dbUpdates.total_reviews = updates.totalReviews;
    if (updates.yearsExperience !== undefined) dbUpdates.years_experience = updates.yearsExperience;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return mapDatabaseUserToUser(data);
  },

  async searchUsers(query: string, userType?: 'buyer' | 'breeder' | 'shelter' | 'admin'): Promise<User[]> {
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%, username.ilike.%${query}%`);
    
    if (userType) {
      queryBuilder = queryBuilder.eq('user_type', userType);
    }
    
    const { data, error } = await queryBuilder;
    if (error) throw error;
    return (data || []).map(mapDatabaseUserToUser);
  }
};

// Listing Service
export const listingService = {
  async createListing(listing: Omit<DogListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<DogListing> {
    const dbListing = mapDogListingToDatabase(listing);
    
    const { data, error } = await supabase
      .from('dog_listings')
      .insert([dbListing])
      .select()
      .single();
    
    if (error) throw error;
    return mapDatabaseListingToDogListing(data);
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

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapDatabaseListingToDogListing);
  },

  async getUserListings(userId: string): Promise<DogListing[]> {
    const { data, error } = await supabase
      .from('dog_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapDatabaseListingToDogListing);
  },

  async updateListing(listingId: string, updates: Partial<DogListing>): Promise<DogListing> {
    // Map updates to database format
    const dbUpdates: any = {};
    if (updates.dogName !== undefined) dbUpdates.dog_name = updates.dogName;
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { data, error } = await supabase
      .from('dog_listings')
      .update(dbUpdates)
      .eq('id', listingId)
      .select()
      .single();
    
    if (error) throw error;
    return mapDatabaseListingToDogListing(data);
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
    return (data || []).map(mapDatabaseListingToDogListing);
  }
};

// Review Service
export const reviewServiceAPI = {
  async getReviewsForUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer_profile:profiles!reviews_reviewer_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('reviewed_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getReviewsForListing(listingId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer_profile:profiles!reviews_reviewer_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createReview(reviewData: {
    reviewed_user_id: string;
    listing_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        reviewer_id: user.user.id,
        ...reviewData
      }])
      .select(`
        *,
        reviewer_profile:profiles!reviews_reviewer_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
    return { average: Math.round(average * 10) / 10, count: data.length };
  }
};

// Add Review interface to existing types
interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  reviewer_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}
