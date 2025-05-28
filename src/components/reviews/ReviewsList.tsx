
import React, { useState, useEffect } from 'react';
import { Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reviewService, Review } from '@/services/reviewService';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';

interface ReviewsListProps {
  userId: string;
  listingId?: string;
  showWriteReview?: boolean;
  onWriteReview?: () => void;
}

const ReviewsList = ({ userId, listingId, showWriteReview = false, onWriteReview }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      
      // Load reviews
      const reviewsData = listingId 
        ? await reviewService.getListingReviews(listingId)
        : await reviewService.getUserReviews(userId);
      
      // Load average rating
      const { average, count } = await reviewService.getUserAverageRating(userId);
      
      setReviews(reviewsData);
      setAverageRating(average);
      setTotalReviews(count);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [userId, listingId]);

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === 'all' || review.rating.toString() === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful_count - a.helpful_count;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {showWriteReview && onWriteReview && (
            <Button onClick={onWriteReview} size="sm">
              Write Review
            </Button>
          )}
        </div>
        
        {totalReviews > 0 ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="md" />
              <span className="text-lg font-medium">{averageRating}</span>
            </div>
            <span className="text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet</p>
        )}
      </div>

      {/* Filters and Sorting */}
      {reviews.length > 0 && (
        <div className="flex gap-4 items-center">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {sortedAndFilteredReviews.length > 0 ? (
          sortedAndFilteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onReviewUpdate={loadReviews}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {filterRating === 'all' 
                ? 'No reviews available yet.' 
                : `No reviews with ${filterRating} star${filterRating !== '1' ? 's' : ''} found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
