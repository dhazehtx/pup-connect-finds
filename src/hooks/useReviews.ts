
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { reviewService, Review } from '@/services/reviewService';

export const useReviews = (userId?: string, listingId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch reviews
      const reviewsData = listingId 
        ? await reviewService.getListingReviews(listingId)
        : await reviewService.getUserReviews(userId);
      
      // Fetch average rating
      const { average, count } = await reviewService.getUserAverageRating(userId);
      
      setReviews(reviewsData);
      setAverageRating(average);
      setTotalReviews(count);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    reviewed_user_id: string;
    listing_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    try {
      const newReview = await reviewService.createReview(reviewData);
      setReviews(prev => [newReview, ...prev]);
      
      // Refresh average rating
      const { average, count } = await reviewService.getUserAverageRating(reviewData.reviewed_user_id);
      setAverageRating(average);
      setTotalReviews(count);
      
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      
      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId, listingId]);

  return {
    reviews,
    averageRating,
    totalReviews,
    loading,
    createReview,
    refetch: fetchReviews
  };
};
