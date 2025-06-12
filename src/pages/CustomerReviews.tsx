
import React, { useState } from 'react';
import { Star, Filter, ThumbsUp, MessageCircle, User, Verified } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CustomerReviews = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const reviews = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png',
        verified: true,
        joinDate: 'Member since 2023'
      },
      rating: 5,
      title: 'Amazing experience finding our perfect puppy!',
      content: 'MY PUP made finding our Golden Retriever so easy. The breeder was verified, professional, and the whole process was transparent. Our puppy is healthy and happy!',
      date: '2 weeks ago',
      helpful: 24,
      category: 'buyer'
    },
    {
      id: 2,
      user: {
        name: 'Mike Davis',
        avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png',
        verified: true,
        joinDate: 'Member since 2022'
      },
      rating: 5,
      title: 'Great platform for responsible breeders',
      content: 'As a verified breeder, MY PUP has helped me connect with loving families. The verification process ensures quality and the platform is easy to use.',
      date: '1 month ago',
      helpful: 18,
      category: 'breeder'
    },
    {
      id: 3,
      user: {
        name: 'Emma Wilson',
        avatar: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
        verified: false,
        joinDate: 'Member since 2024'
      },
      rating: 4,
      title: 'Good experience, minor issues with communication',
      content: 'Overall positive experience. Found a great puppy and the payment process was secure. Had some delay in communication but support team helped resolve it quickly.',
      date: '3 weeks ago',
      helpful: 12,
      category: 'buyer'
    },
    {
      id: 4,
      user: {
        name: 'David Brown',
        avatar: '/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png',
        verified: true,
        joinDate: 'Member since 2023'
      },
      rating: 5,
      title: 'Trust and safety features are excellent',
      content: 'The verification system and secure payment options gave me confidence throughout the process. Highly recommend for anyone looking for a puppy.',
      date: '1 week ago',
      helpful: 31,
      category: 'buyer'
    }
  ];

  const stats = {
    totalReviews: 1247,
    averageRating: 4.8,
    fiveStars: 87,
    fourStars: 10,
    threeStars: 2,
    twoStars: 1,
    oneStars: 0
  };

  const filteredReviews = selectedFilter === 'all' 
    ? reviews 
    : reviews.filter(review => review.category === selectedFilter);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl opacity-90">See what our community has to say about MY PUP</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overall Stats */}
        <Card className="mb-8 border-royal-blue">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{stats.averageRating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {renderStars(Math.floor(stats.averageRating))}
                </div>
                <p className="text-black/70">Based on {stats.totalReviews.toLocaleString()} reviews</p>
              </div>
              
              <div className="space-y-2">
                {[
                  { stars: 5, percentage: stats.fiveStars },
                  { stars: 4, percentage: stats.fourStars },
                  { stars: 3, percentage: stats.threeStars },
                  { stars: 2, percentage: stats.twoStars },
                  { stars: 1, percentage: stats.oneStars }
                ].map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm text-black w-8">{item.stars} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-black/70 w-8">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              className={selectedFilter === 'all' ? 'bg-royal-blue text-white' : 'border-royal-blue text-black'}
            >
              <Filter className="mr-2" size={16} />
              All Reviews
            </Button>
            <Button
              variant={selectedFilter === 'buyer' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('buyer')}
              className={selectedFilter === 'buyer' ? 'bg-royal-blue text-white' : 'border-royal-blue text-black'}
            >
              Buyers
            </Button>
            <Button
              variant={selectedFilter === 'breeder' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('breeder')}
              className={selectedFilter === 'breeder' ? 'bg-royal-blue text-white' : 'border-royal-blue text-black'}
            >
              Breeders
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="border-royal-blue">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-black">{review.user.name}</h3>
                      {review.user.verified && (
                        <Badge variant="outline" className="text-royal-blue border-royal-blue">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-black/60">
                        {review.category === 'buyer' ? 'Buyer' : 'Breeder'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-black/60">{review.date}</span>
                    </div>
                    
                    <h4 className="font-semibold text-black mb-2">{review.title}</h4>
                    <p className="text-black/70 mb-4">{review.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-black/60">
                      <button className="flex items-center gap-1 hover:text-royal-blue">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.user.joinDate}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-black mb-4">Share Your Experience</h3>
            <p className="text-black/70 mb-6">
              Help others by sharing your experience with MY PUP
            </p>
            <Button className="bg-royal-blue text-white hover:bg-royal-blue/90">
              <MessageCircle className="mr-2" size={16} />
              Write a Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerReviews;
