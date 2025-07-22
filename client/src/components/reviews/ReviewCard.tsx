
import React, { useState, useEffect } from 'react';
import { ThumbsUp, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { reviewService, Review } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  onReviewUpdate?: () => void;
}

const ReviewCard = ({ review, onReviewUpdate }: ReviewCardProps) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [isUpdatingHelpful, setIsUpdatingHelpful] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkHelpfulStatus = async () => {
      if (user) {
        try {
          const helpful = await reviewService.hasUserMarkedHelpful(review.id);
          setIsHelpful(helpful);
        } catch (error) {
          console.error('Error checking helpful status:', error);
        }
      }
    };

    checkHelpfulStatus();
  }, [review.id, user]);

  const handleHelpfulClick = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark reviews as helpful.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingHelpful(true);
      
      if (isHelpful) {
        await reviewService.removeHelpfulMark(review.id);
        setIsHelpful(false);
        setHelpfulCount(prev => prev - 1);
      } else {
        await reviewService.markReviewHelpful(review.id);
        setIsHelpful(true);
        setHelpfulCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating helpful status:', error);
      toast({
        title: "Error",
        description: "Failed to update helpful status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingHelpful(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.reviewer_profile?.avatar_url || ''} />
            <AvatarFallback>
              {getInitials(review.reviewer_profile?.full_name || review.reviewer_profile?.username || 'Anonymous')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm">
                  {review.reviewer_profile?.full_name || review.reviewer_profile?.username || 'Anonymous'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {review.title && (
              <h5 className="font-medium text-sm mb-2">{review.title}</h5>
            )}

            {review.comment && (
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {review.comment}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulClick}
                disabled={isUpdatingHelpful}
                className={`h-8 px-2 ${isHelpful ? 'text-blue-600' : 'text-muted-foreground'}`}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${isHelpful ? 'fill-current' : ''}`} />
                <span className="text-xs">
                  Helpful {helpfulCount > 0 && `(${helpfulCount})`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
