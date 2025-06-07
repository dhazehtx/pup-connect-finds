
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

interface StatsData {
  verifiedBreeders: number;
  successfulAdoptions: number;
  averageRating: number;
  totalReviews: number;
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    verifiedBreeders: 0,
    successfulAdoptions: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReviewData = async () => {
    try {
      setLoading(true);

      // Fetch reviews with profile data
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          reviewer_id,
          reviewed_user_id
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (reviewsError) throw reviewsError;

      // Fetch profile data for reviewers and reviewed users
      const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
      const reviewedUserIds = reviewsData?.map(r => r.reviewed_user_id) || [];
      const allUserIds = [...new Set([...reviewerIds, ...reviewedUserIds])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_type, verified')
        .in('id', allUserIds);

      // Combine reviews with profile data
      const enrichedReviews = reviewsData?.map(review => ({
        ...review,
        reviewer_profile: profilesData?.find(p => p.id === review.reviewer_id) || null,
        reviewed_user_profile: profilesData?.find(p => p.id === review.reviewed_user_id) || null
      })) || [];

      setReviews(enrichedReviews);

      // Calculate statistics
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating');

      const { data: verifiedBreedersData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'breeder')
        .eq('verified', true);

      const { data: adoptionsData } = await supabase
        .from('dog_listings')
        .select('id')
        .eq('status', 'sold');

      const totalReviews = allReviews?.length || 0;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      setStats({
        verifiedBreeders: verifiedBreedersData?.length || 0,
        successfulAdoptions: adoptionsData?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      });

    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'breeders':
        navigate('/explore'); // Navigate to explore page to see breeders
        break;
      case 'adoptions':
        navigate('/explore'); // Navigate to explore page
        break;
      case 'rating':
        // Scroll to reviews section
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Real stories from families who found their perfect puppy through MY PUP
          </p>
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          What Our Customers Say
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Real stories from families who found their perfect puppy through MY PUP
        </p>
        
        {/* Dynamic Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card 
            className="border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('breeders')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">{stats.verifiedBreeders}</div>
              <div className="text-sm text-muted-foreground">Verified Breeders</div>
            </CardContent>
          </Card>
          
          <Card 
            className="border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('adoptions')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">{stats.successfulAdoptions}</div>
              <div className="text-sm text-muted-foreground">Successful Adoptions</div>
            </CardContent>
          </Card>
          
          <Card 
            className="border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('rating')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">{stats.averageRating}/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">{stats.totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No reviews available yet
            </p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your experience with MY PUP!
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Ready to find your perfect puppy companion? Browse our verified breeders 
              and discover why families trust MY PUP to help them find their new best friend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/explore')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse Puppies
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/help')}
                className="border-border text-foreground hover:bg-muted"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerReviews;
