
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewPhoto {
  id: string;
  review_id: string;
  image_url: string;
  caption?: string;
}

interface EnhancedReview {
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
  reviewer_profile?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    verified: boolean;
  };
  photos?: ReviewPhoto[];
  user_helpful_vote?: boolean;
}

export const useEnhancedReviews = () => {
  const [reviews, setReviews] = useState<EnhancedReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Upload review photo
  const uploadReviewPhoto = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading review photo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [user, toast]);

  // Create review with photos
  const createReview = useCallback(async (
    reviewedUserId: string,
    rating: number,
    title?: string,
    comment?: string,
    listingId?: string,
    photos?: File[]
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      // Create the review first
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert([{
          reviewer_id: user.id,
          reviewed_user_id: reviewedUserId,
          listing_id: listingId,
          rating,
          title,
          comment
        }])
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Upload photos if provided
      if (photos && photos.length > 0) {
        const photoUploads = photos.map(async (photo) => {
          const photoUrl = await uploadReviewPhoto(photo);
          if (photoUrl) {
            return supabase
              .from('review_photos')
              .insert([{
                review_id: review.id,
                image_url: photoUrl
              }]);
          }
          return null;
        });

        await Promise.all(photoUploads);
      }

      toast({
        title: "Review Posted",
        description: "Your review has been submitted successfully",
      });

      // Refresh reviews
      await fetchReviewsForUser(reviewedUserId);
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "Failed to post review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, uploadReviewPhoto]);

  // Fetch reviews for a user
  const fetchReviewsForUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (
            full_name,
            username,
            avatar_url,
            verified
          )
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch photos for each review
      const reviewsWithPhotos = await Promise.all((data || []).map(async (review) => {
        try {
          const { data: photos } = await supabase
            .from('review_photos')
            .select('*')
            .eq('review_id', review.id);

          // Ensure we have a valid reviewer_profile
          const validReviewerProfile = review.reviewer_profile && typeof review.reviewer_profile === 'object' && !('error' in review.reviewer_profile)
            ? review.reviewer_profile
            : {
                full_name: 'Unknown User',
                username: 'unknown',
                verified: false
              };

          return {
            ...review,
            reviewer_profile: validReviewerProfile,
            photos: photos || []
          };
        } catch (photoError) {
          console.error('Error fetching photos for review:', photoError);
          return {
            ...review,
            reviewer_profile: {
              full_name: 'Unknown User',
              username: 'unknown',
              verified: false
            },
            photos: []
          };
        }
      }));

      // Check if current user has voted helpful on each review
      if (user && reviewsWithPhotos) {
        const reviewIds = reviewsWithPhotos.map(r => r.id);
        const { data: helpfulVotes } = await supabase
          .from('review_helpfulness')
          .select('review_id')
          .eq('user_id', user.id)
          .in('review_id', reviewIds);

        const votedReviewIds = new Set(helpfulVotes?.map(v => v.review_id) || []);
        
        const reviewsWithVotes = reviewsWithPhotos.map(review => ({
          ...review,
          user_helpful_vote: votedReviewIds.has(review.id)
        }));

        setReviews(reviewsWithVotes);
      } else {
        setReviews(reviewsWithPhotos || []);
      }
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
  }, [user, toast]);

  // Vote helpful on review
  const voteHelpful = useCallback(async (reviewId: string) => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_helpfulness')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Remove vote
        await supabase
          .from('review_helpfulness')
          .delete()
          .eq('id', existingVote.id);

        // Update local state
        setReviews(prev => prev.map(review =>
          review.id === reviewId
            ? { 
                ...review, 
                helpful_count: review.helpful_count - 1,
                user_helpful_vote: false
              }
            : review
        ));
      } else {
        // Add vote
        await supabase
          .from('review_helpfulness')
          .insert([{
            review_id: reviewId,
            user_id: user.id
          }]);

        // Update local state
        setReviews(prev => prev.map(review =>
          review.id === reviewId
            ? { 
                ...review, 
                helpful_count: review.helpful_count + 1,
                user_helpful_vote: true
              }
            : review
        ));
      }
    } catch (error) {
      console.error('Error voting helpful:', error);
      toast({
        title: "Error",
        description: "Failed to vote on review",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Get user's average rating
  const getUserRating = useCallback(async (userId: string) => {
    try {
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
    } catch (error) {
      console.error('Error getting user rating:', error);
      return { average: 0, count: 0 };
    }
  }, []);

  return {
    reviews,
    loading,
    uploading,
    createReview,
    fetchReviewsForUser,
    voteHelpful,
    getUserRating,
    uploadReviewPhoto
  };
};
