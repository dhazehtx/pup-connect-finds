
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, MessageCircle, Phone, MapPin, Calendar, Star, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      if (user) {
        checkIfFavorited();
      }
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            rating,
            total_reviews,
            verified,
            location
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        setError('Listing not found or no longer available');
        return;
      }

      setListing(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
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
      // Not favorited or error - either way, not favorited
      setIsFavorited(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
      });
      navigate('/auth');
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
        toast({ title: "Removed from favorites" });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: id });
        
        setIsFavorited(true);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Check out ${listing?.dog_name} - ${listing?.breed}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Listing link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
      });
      navigate('/auth');
      return;
    }

    if (user.id === listing?.user_id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot contact yourself about your own listing",
        variant: "destructive",
      });
      return;
    }

    // Navigate to messages with the listing context
    navigate(`/messages?contact=${listing?.user_id}&listing=${listing?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading listing..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState 
          title="Listing not found"
          description={error || "This listing may have been removed or is no longer available"}
          actionText="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
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

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Essential Info Block */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Name, Breed, Age, Price, Location */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{listing.dog_name}</h1>
                    <div className="text-2xl font-bold text-[#2C3EDC]">
                      ${listing.price?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-[#2C3EDC] text-[#2C3EDC]">
                      {listing.breed}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      {listing.age} {listing.age === 1 ? 'month' : 'months'} old
                    </Badge>
                    {listing.gender && (
                      <Badge variant="outline" className="text-gray-600">
                        {listing.gender}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {listing.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Listed {formatDate(listing.created_at)}</span>
                    </div>
                  </div>

                  {/* Health Badges */}
                  <div className="flex flex-wrap gap-2">
                    {listing.vaccinated && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        ✓ Vaccinated
                      </Badge>
                    )}
                    {listing.neutered_spayed && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        ✓ Neutered/Spayed
                      </Badge>
                    )}
                    {listing.good_with_kids && (
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        ✓ Good with Kids
                      </Badge>
                    )}
                    {listing.good_with_dogs && (
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                        ✓ Good with Dogs
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    className={`flex-1 ${isFavorited ? 'text-red-500 border-red-200' : 'text-gray-600'}`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 text-gray-600"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContact}
                    className="flex-1 bg-[#2C3EDC] hover:bg-[#2C3EDC]/90"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            {listing.description && (
              <Card>
                <Collapsible open={aboutExpanded} onOpenChange={setAboutExpanded}>
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          🐶 About {listing.dog_name}
                        </h3>
                        {aboutExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* Seller Card */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  👤 Seller Information
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.profiles?.avatar_url} />
                    <AvatarFallback>
                      {listing.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {listing.profiles?.full_name || 'Anonymous Seller'}
                      </span>
                      {listing.profiles?.verified && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {listing.profiles?.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{listing.profiles.rating.toFixed(1)}</span>
                        <span className="text-gray-500">
                          ({listing.profiles.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                    {listing.profiles?.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.profiles.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <Collapsible open={reviewsExpanded} onOpenChange={setReviewsExpanded}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        ⭐️ Reviews ({listing.profiles?.total_reviews || 0})
                      </h3>
                      {reviewsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No reviews yet for this seller</p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Contact Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <Button
          onClick={handleContact}
          className="w-full bg-[#2C3EDC] hover:bg-[#2C3EDC]/90"
          size="lg"
        >
          <Phone className="h-4 w-4 mr-2" />
          Contact Seller
        </Button>
      </div>

      {/* Mobile spacing for sticky bar */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default ListingDetail;
