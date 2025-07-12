
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart, MapPin, Calendar, Ruler, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import ContactSellerButton from '@/components/messaging/ContactSellerButton';
import { useSocialShare } from '@/hooks/useSocialShare';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { shareToTwitter, shareToFacebook, copyToClipboard, nativeShare, canNativeShare } = useSocialShare();
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock listing data - in real app this would come from API
  const listing = {
    id: '1',
    dog_name: 'Buddy',
    breed: 'Golden Retriever',
    age: 8,
    price: 1200,
    location: 'San Francisco, CA',
    description: 'Buddy is a friendly and energetic Golden Retriever puppy looking for his forever home. He loves to play fetch, go for walks, and cuddle with his family. Buddy is up to date on all his vaccinations and has been health checked by our veterinarian.',
    size: 'Large',
    gender: 'Male',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&h=400&fit=crop'
    ],
    seller: {
      id: 'seller123',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviews: 23,
      location: 'San Francisco, CA',
      joinDate: 'March 2023',
      totalListings: 12
    },
    features: [
      'Vaccinated',
      'Health Checked',
      'Microchipped',
      'House Trained'
    ]
  };

  const handleShare = async () => {
    const shareData = {
      title: `${listing.dog_name} - ${listing.breed}`,
      description: `Check out this adorable ${listing.breed} puppy looking for a forever home!`,
      url: window.location.href
    };

    if (canNativeShare) {
      try {
        await nativeShare(shareData);
      } catch (error) {
        // Fallback to clipboard if native share fails
        await copyToClipboard(shareData);
      }
    } else {
      await copyToClipboard(shareData);
    }
  };

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings",
        variant: "destructive",
      });
      return;
    }
    
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Listing removed from your favorites" : "Listing saved to your favorites",
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

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
          <img
            src={listing.images[currentImageIndex]}
            alt={`${listing.dog_name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {listing.images.length > 1 && (
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
              {currentImageIndex + 1} / {listing.images.length}
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
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              {listing.location}
            </div>
            <div className="flex items-center gap-1">
              <Ruler size={16} />
              {listing.size}
            </div>
          </div>
        </div>

        <div className="text-3xl font-bold text-royal-blue">
          ${listing.price.toLocaleString()}
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
            sellerId={listing.seller.id}
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
        <div className="flex flex-wrap gap-2">
          {listing.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="flex items-center gap-1">
              <Award size={12} />
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      {/* Seller Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={listing.seller.avatar} />
              <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>★ {listing.seller.rating} ({listing.seller.reviews} reviews)</span>
                <span>📍 {listing.seller.location}</span>
                <span>📅 Joined {listing.seller.joinDate}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {listing.seller.totalListings} active listings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${listing.seller.id}`)}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3">About {listing.dog_name}</h3>
          <p className="text-gray-700 leading-relaxed">{listing.description}</p>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3">Reviews</h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Mike Davis</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>★★★★★</span>
                    <span className="ml-2">2 weeks ago</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                "Sarah was amazing to work with! The puppy was exactly as described and the entire process was smooth and professional."
              </p>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Emma Wilson</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>★★★★★</span>
                    <span className="ml-2">1 month ago</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                "Highly recommend! The puppy is healthy, well-socialized, and came with all the necessary documentation."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingDetail;
