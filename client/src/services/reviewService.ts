import { supabase } from '@/integrations/supabase/client';

export interface Review {
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

export const reviewService = {
  // Create a new review
  async createReview(reviewData: {
    reviewed_user_id: string;
    listing_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        reviewer_id: userData.user.id,
        ...reviewData
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the reviewer profile separately
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, username, avatar_url')
      .eq('id', userData.user.id)
      .single();
    
    return {
      ...data,
      reviewer_profile: profileData ? {
        full_name: profileData.full_name,
        username: profileData.username,
        avatar_url: profileData.avatar_url
      } : undefined
    };
  },

  // Get reviews for a specific user
  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    // Fetch reviewer profiles separately
    const reviewerIds = data.map(review => review.reviewer_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', reviewerIds);

    // Combine reviews with profiles
    return data.map(review => ({
      ...review,
      reviewer_profile: profiles?.find(profile => profile.id === review.reviewer_id) ? {
        full_name: profiles.find(profile => profile.id === review.reviewer_id)?.full_name || null,
        username: profiles.find(profile => profile.id === review.reviewer_id)?.username || null,
        avatar_url: profiles.find(profile => profile.id === review.reviewer_id)?.avatar_url || null
      } : undefined
    }));
  },

  // Get reviews for a specific listing
  async getListingReviews(listingId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    // Fetch reviewer profiles separately
    const reviewerIds = data.map(review => review.reviewer_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', reviewerIds);

    // Combine reviews with profiles
    return data.map(review => ({
      ...review,
      reviewer_profile: profiles?.find(profile => profile.id === review.reviewer_id) ? {
        full_name: profiles.find(profile => profile.id === review.reviewer_id)?.full_name || null,
        username: profiles.find(profile => profile.id === review.reviewer_id)?.username || null,
        avatar_url: profiles.find(profile => profile.id === review.reviewer_id)?.avatar_url || null
      } : undefined
    }));
  },

  // Get average rating for a user
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
  },

  // Mark review as helpful
  async markReviewHelpful(reviewId: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('review_helpfulness')
      .insert([{
        review_id: reviewId,
        user_id: userData.user.id
      }]);

    if (error) throw error;
  },

  // Remove helpful mark
  async removeHelpfulMark(reviewId: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('review_helpfulness')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userData.user.id);

    if (error) throw error;
  },

  // Check if user has marked review as helpful
  async hasUserMarkedHelpful(reviewId: string): Promise<boolean> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return false;

    const { data, error } = await supabase
      .from('review_helpfulness')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};
