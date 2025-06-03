
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch reviews for a user
  const fetchReviews = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id(full_name, username, avatar_url),
          listing:listing_id(dog_name, breed)
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a review
  const createReview = async (reviewData: {
    reviewed_user_id: string;
    listing_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          reviewer_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update a review
  const updateReview = async (reviewId: string, updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('reviewer_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to update review",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete a review
  const deleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      setReviews(prev => prev.filter(review => review.id !== reviewId));

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Mark review as helpful
  const markHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark reviews as helpful.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpfulness')
        .insert([{
          review_id: reviewId,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Marked as helpful",
        description: "Thank you for your feedback!",
      });
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Already marked",
          description: "You've already marked this review as helpful.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to mark as helpful",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Get average rating for a user
  const getAverageRating = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', userId);

      if (error) throw error;

      const ratings = data || [];
      if (ratings.length === 0) return { average: 0, count: 0 };

      const sum = ratings.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / ratings.length;

      return { average: Math.round(average * 10) / 10, count: ratings.length };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return { average: 0, count: 0 };
    }
  };

  return {
    reviews,
    loading,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getAverageRating,
  };
};
