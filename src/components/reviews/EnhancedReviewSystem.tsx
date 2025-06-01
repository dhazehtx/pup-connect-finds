
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, Camera, Flag, MoreVertical } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import StarRating from './StarRating';

interface EnhancedReviewSystemProps {
  userId: string;
  listingId?: string;
  transactionId?: string;
}

const EnhancedReviewSystem: React.FC<EnhancedReviewSystemProps> = ({
  userId,
  listingId,
  transactionId
}) => {
  const { reviews, averageRating, totalReviews, createReview } = useReviews(userId, listingId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    photos: [] as File[]
  });

  const handleSubmitReview = async () => {
    try {
      await createReview({
        reviewed_user_id: userId,
        listing_id: listingId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });
      
      setShowReviewForm(false);
      setNewReview({ rating: 0, title: '', comment: '', photos: [] });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewReview(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">
                <StarRating rating={averageRating} readonly />
              </div>
              <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-2">{star}</span>
                      <Star size={12} className="fill-current text-yellow-500" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Button */}
      {transactionId && (
        <div className="flex justify-center">
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <StarRating 
                rating={newReview.rating} 
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Review</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your detailed experience..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Photos (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Camera className="mr-2" size={16} />
                  Add Photos
                </Button>
                {newReview.photos.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {newReview.photos.length} photo(s) selected
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={newReview.rating === 0}>
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Anonymous User</span>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical size={16} />
                </Button>
              </div>
              
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp size={16} className="mr-1" />
                    Helpful ({review.helpful_count || 0})
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Flag size={16} className="mr-1" />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedReviewSystem;
