import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Star, MessageSquare, User, Send } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review: string | null;
  is_verified_purchase: boolean;
  is_hidden: boolean;
  created_at: string;
  user?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  averageRating?: string | null;
  reviewsCount?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ 
  productId, 
  productName, 
  averageRating,
  reviewsCount = 0 
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Fetch reviews for this product
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/reviews', productId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { product_id: string; rating: number; review?: string }) => {
      return await apiRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setShowReviewForm(false);
      setRating(0);
      setReviewText('');
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      product_id: productId,
      rating,
      review: reviewText.trim() || undefined,
    });
  };

  const renderStars = (starRating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5', 
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= starRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const userHasReviewed = reviews.some((review: Review) => review.user_id === profile?.id);

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {averageRating ? (
            <div className="flex items-center gap-4">
              {renderStars(parseFloat(averageRating), false, 'lg')}
              <div className="text-2xl font-bold">{parseFloat(averageRating).toFixed(1)}</div>
              <div className="text-gray-600">
                Based on {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No reviews yet for {productName}</div>
          )}

          {/* Write Review Button */}
          {profile && !userHasReviewed && (
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="mt-4"
            >
              <Star className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}

          {userHasReviewed && (
            <Badge variant="secondary" className="mt-4">
              You have already reviewed this product
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              {renderStars(rating, true, 'lg')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending || rating === 0}
                className="flex-1"
              >
                {createReviewMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setReviewText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {review.user?.avatar_url ? (
                      <img 
                        src={review.user.avatar_url} 
                        alt={review.user.display_name || review.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {review.user?.display_name || review.user?.username || 'Anonymous User'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating, false, 'sm')}
                          {review.is_verified_purchase && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    {review.review && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.review}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !showReviewForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review {productName}!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductReviews;