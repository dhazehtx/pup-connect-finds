
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  reviewed_user_profile: {
    full_name: string | null;
    user_type: string | null;
    verified: boolean;
  } | null;
}

interface CustomerReviewsListProps {
  reviews: ReviewData[];
  loading: boolean;
}

const CustomerReviewsList: React.FC<CustomerReviewsListProps> = ({ reviews, loading }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">
          No reviews available yet
        </p>
        <p className="text-sm text-muted-foreground">
          Be the first to share your experience with MY PUP!
        </p>
      </div>
    );
  }

  return (
    <div id="reviews-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <Card key={review.id} className="border-border h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={review.reviewer_profile?.avatar_url || ''} alt={review.reviewer_profile?.full_name || 'User'} />
                <AvatarFallback>
                  {review.reviewer_profile?.full_name?.charAt(0) || review.reviewer_profile?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">
                    {review.reviewer_profile?.full_name || review.reviewer_profile?.username || 'Anonymous User'}
                  </h4>
                  {review.reviewed_user_profile?.verified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Reviewed: {review.reviewed_user_profile?.full_name || 'Service Provider'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {renderStars(review.rating)}
              </div>
              {review.reviewed_user_profile?.user_type && (
                <Badge variant="outline" className="text-xs capitalize">
                  {review.reviewed_user_profile.user_type}
                </Badge>
              )}
            </div>
            
            {review.title && (
              <h5 className="font-medium text-foreground">{review.title}</h5>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {review.comment || 'No detailed comment provided.'}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerReviewsList;
