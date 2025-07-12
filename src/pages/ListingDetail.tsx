import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart, MapPin, Calendar, Ruler, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import ContactSellerButton from '@/components/messaging/ContactSellerButton';
import { useShare } from '@/hooks/useShare';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { shareContent } = useShare();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch listing data from Supabase with proper ID handling
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "No listing ID provided",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching listing with ID:', id);
        
        // Fetch listing with seller profile - ensure we're getting the right listing by ID
        const { data: listingData, error: listingError } = await supabase
          .from('dog_listings')
          .select(`
            *,
            profiles!dog_listings_user_id_fkey (
              id,
              full_name,
              username,
              avatar_url,
              location,
              created_at,
              rating,
              total_reviews
            )
          `)
          .eq('id', id)
          .eq('status', 'active')
          .single();

        if (listingError) {
          console.error('Error fetching listing:', listingError);
          if (listingError.code === 'PGRST116') {
            toast({
              title: "Not Found",
              description: "This listing could not be found or is no longer active",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to load listing details",
              variant: "destructive",
            });
          }
          navigate('/marketplace');
          return;
        }

        if (!listingData) {
          toast({
            title: "Not Found",
            description: "This listing could not be found",
            variant: "destructive",
          });
          navigate('/marketplace');
          return;
        }

        console.log('Fetched listing data:', listingData);
        setListing(listingData);

        // Check if user has favorited this listing
        if (user) {
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .single();
          
          setIsFavorited(!!favoriteData);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user, toast, navigate]);

  const handleShare = async () => {
    if (!listing) return;
    
    const title = `${listing.dog_name} - ${listing.breed}`;
    const text = `Check out this adorable ${listing.breed} puppy looking for a forever home!`;
    const url = window.location.href;

    await shareContent(title, text, url);
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings",
        variant: "destructive",
      });
      return;
    }

    if (!listing) return;
    
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your favorites",
        });
      } else {
        await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            listing_id: listing.id
          }]);
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Listing saved to your favorites",
        });
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

  const nextImage = () => {
    if (!listing?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    if (!listing?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Button onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  // Properly handle images - prefer the images array, fallback to single image_url
  const images = listing.images && listing.images.length > 0 ? listing.images : 
                 listing.image_url ? [listing.image_url] : [];
  
  const seller = listing.profiles || {};

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Listing Details</h1>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={`${listing.dog_name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', images[currentImageIndex]);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ArrowLeft size={16} className="rotate-180" />
            </Button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Listing Info */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{listing.dog_name}</h2>
          <p className="text-lg text-gray-600">{listing.breed}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {listing.age} weeks old
            </div>
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {listing.location}
              </div>
            )}
            {listing.size && (
              <div className="flex items-center gap-1">
                <Ruler size={16} />
                {listing.size}
              </div>
            )}
          </div>
        </div>

        <div className="text-3xl font-bold text-royal-blue">
          ${listing.price?.toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={`${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </Button>
          
          <ContactSellerButton
            listingId={listing.id}
            sellerId={listing.user_id}
            className="flex-1 bg-royal-blue hover:bg-royal-blue/90"
          >
            Contact Seller
          </ContactSellerButton>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
            title="Share this listing"
          >
            <Share size={16} />
            Share
          </Button>
        </div>

        {/* Features */}
        {(listing.vaccinated || listing.neutered_spayed || listing.good_with_kids || listing.good_with_dogs) && (
          <div className="flex flex-wrap gap-2">
            {listing.vaccinated && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Vaccinated
              </Badge>
            )}
            {listing.neutered_spayed && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Spayed/Neutered
              </Badge>
            )}
            {listing.good_with_kids && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Good with Kids
              </Badge>
            )}
            {listing.good_with_dogs && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Good with Dogs
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Seller Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={seller.avatar_url} />
              <AvatarFallback>{seller.full_name?.charAt(0) || seller.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{seller.full_name || seller.username || 'Unknown User'}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {seller.rating && (
                  <span>★ {seller.rating} ({seller.total_reviews || 0} reviews)</span>
                )}
                {seller.location && (
                  <span>📍 {seller.location}</span>
                )}
                {seller.created_at && (
                  <span>📅 Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${seller.id}`)}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      {listing.description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">About {listing.dog_name}</h3>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListingDetail;
