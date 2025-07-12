
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Calendar, Star, ArrowLeft, Phone, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PaymentButton from '@/components/payments/PaymentButton';
import ReviewForm from '@/components/reviews/ReviewForm';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description?: string;
  location?: string;
  image_url?: string;
  status: string;
  created_at: string;
  user_id: string;
  color?: string;
  gender?: string;
  size?: string;
  vaccinated?: boolean;
  neutered_spayed?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  profiles?: {
    full_name: string;
    username: string;
    verified: boolean;
    rating?: number;
    total_reviews?: number;
  };
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchListing();
      fetchReviews();
      checkIfFavorited();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles!dog_listings_user_id_fkey (
            full_name,
            username,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey (
            full_name,
            username
          )
        `)
        .eq('listing_id', id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkIfFavorited = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single();
      
      setIsFavorited(!!data);
    } catch (error) {
      // Not favorited or error - keep as false
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "This listing has been removed from your favorites",
        });
      } else {
        await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            listing_id: id
          }]);
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "This listing has been added to your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: `Thank you for your purchase! The seller will contact you soon.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2C3EDC] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/explore')} className="bg-[#2C3EDC] hover:bg-[#2C3EDC]/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/explore')}
            className="border-[#2C3EDC] text-[#2C3EDC] hover:bg-[#2C3EDC] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <img 
                src={listing.image_url || '/placeholder.svg'}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">{listing.dog_name}</h1>
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <Badge className="bg-[#2C3EDC] text-white hover:bg-[#2C3EDC]/90">
                          {listing.breed}
                        </Badge>
                        <Badge variant="outline" className="border-[#2C3EDC] text-[#2C3EDC]">
                          {listing.age} {listing.age === 1 ? 'month' : 'months'} old
                        </Badge>
                        {listing.gender && (
                          <Badge variant="outline" className="border-gray-300">
                            {listing.gender}
                          </Badge>
                        )}
                        {listing.size && (
                          <Badge variant="outline" className="border-gray-300">
                            {listing.size}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleFavorite}
                        className={`rounded-full ${isFavorited ? 'text-red-500 border-red-500 hover:bg-red-50' : 'border-gray-300 hover:border-[#2C3EDC]'}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full border-gray-300 hover:border-[#2C3EDC]">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-4xl font-bold text-[#2C3EDC] mb-6">
                    ${listing.price?.toLocaleString()}
                  </div>
                </div>

                {/* Location and Date */}
                <div className="space-y-3 pb-6 border-b border-gray-100">
                  {listing.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{listing.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Health & Care Info */}
                {(listing.vaccinated || listing.neutered_spayed || listing.good_with_kids || listing.good_with_dogs) && (
                  <div className="pb-6 border-b border-gray-100">
                    <h3 className="font-semibold mb-3 text-gray-900">Health & Care</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.vaccinated && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          ✓ Vaccinated
                        </Badge>
                      )}
                      {listing.neutered_spayed && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          ✓ Spayed/Neutered
                        </Badge>
                      )}
                      {listing.good_with_kids && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          ✓ Good with Kids
                        </Badge>
                      )}
                      {listing.good_with_dogs && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          ✓ Good with Dogs
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {listing.description && (
                  <div className="pb-6 border-b border-gray-100">
                    <h3 className="font-semibold mb-3 text-gray-900">About {listing.dog_name}</h3>
                    <p className="text-gray-600 leading-relaxed">{listing.description}</p>
                  </div>
                )}

                {/* Seller Info */}
                <div className="pb-6 border-b border-gray-100">
                  <h3 className="font-semibold mb-3 text-gray-900">Seller Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2C3EDC] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {listing.profiles?.full_name?.charAt(0) || listing.profiles?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {listing.profiles?.full_name || listing.profiles?.username || 'Anonymous'}
                        </span>
                        {listing.profiles?.verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      {listing.profiles?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {listing.profiles.rating} ({listing.profiles.total_reviews || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwner && (
                  <div className="space-y-3">
                    {user ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            className="border-[#2C3EDC] text-[#2C3EDC] hover:bg-[#2C3EDC] hover:text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-[#2C3EDC] text-[#2C3EDC] hover:bg-[#2C3EDC] hover:text-white"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                        
                        <PaymentButton
                          amount={listing.price}
                          description={`${listing.dog_name} - ${listing.breed}`}
                          listingId={listing.id}
                          onSuccess={handlePaymentSuccess}
                          className="w-full bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 text-white shadow-lg"
                        />
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          onClick={() => navigate('/auth')}
                          className="w-full bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 shadow-lg"
                        >
                          Sign In to Contact Seller
                        </Button>
                        <p className="text-sm text-gray-500 text-center">
                          Create an account to message sellers and purchase puppies
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Review Form - Only show for authenticated users who don't own the listing */}
              {user && !isOwner && (
                <div className="mb-8">
                  <ReviewForm 
                    listingId={listing.id} 
                    sellerId={listing.user_id}
                    onReviewSubmitted={fetchReviews}
                  />
                </div>
              )}

              {/* Reviews Display */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2C3EDC] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {review.profiles?.full_name?.charAt(0) || review.profiles?.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.profiles?.full_name || review.profiles?.username || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
