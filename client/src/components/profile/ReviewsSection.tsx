
import React, { useState } from 'react';
import { Star, ThumbsUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: number;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
  verified: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
  userType?: string;
}

const ReviewsSection = ({ reviews, userType }: ReviewsSectionProps) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const toggleExpanded = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      {/* Rating summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
            <span className="font-medium">{averageRating}</span>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>
          {userType === 'breeder' && (
            <Badge variant="secondary">Verified Breeder</Badge>
          )}
        </div>
        
        {/* Rating breakdown */}
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => r.rating === stars).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-2">{stars}</span>
                <Star size={10} className="text-yellow-500 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.text.length > 150;
            const displayText = isExpanded || !shouldTruncate 
              ? review.text 
              : review.text.substring(0, 150) + '...';

            return (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>
                      {review.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.author}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal size={12} />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-600 text-xs">{review.date}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {displayText}
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(review.id)}
                          className="text-blue-600 ml-1 text-sm"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ThumbsUp size={12} className="mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
