
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, CalendarDays, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock data - in real app this would come from API
  const listing = {
    id: id,
    dog_name: "Buddy",
    breed: "Golden Retriever",
    age: 8, // weeks
    price: 1200,
    description: "Beautiful, well-trained Golden Retriever puppy looking for a loving home. Great with kids and other pets. Vaccinated, microchipped, and comes with health certificate. Perfect family companion with excellent temperament.",
    location: "San Francisco, CA",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop"
    ],
    seller: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews_count: 23,
      verified: true,
      location: "San Francisco, CA"
    },
    created_at: "2024-01-15",
    vaccinated: true,
    microchipped: true,
    health_certificate: true
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading listing..." />
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

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: `${listing.dog_name} ${isFavorited ? 'removed from' : 'added to'} your favorites`
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.dog_name} - ${listing.breed}`,
        text: `Check out this adorable ${listing.breed} puppy!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Listing link copied to clipboard"
      });
    }
  };

  const handleContact = () => {
    toast({
      title: "Message sent!",
      description: `Your message to ${listing.seller.name} has been sent.`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                className="text-gray-600 hover:text-red-500"
              >
                <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600 hover:text-[#2C3EDC]"
              >
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-[#2C3EDC]' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${listing.dog_name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Main Info Block */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.dog_name}</h1>
                  <div className="text-3xl font-bold text-[#2C3EDC] mb-3">
                    ${listing.price.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Breed</span>
                    <p className="font-medium">{listing.breed}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Age</span>
                    <p className="font-medium">{listing.age} weeks</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">Location</span>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-gray-400" />
                      <p className="font-medium">{listing.location}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Listed</span>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarDays size={14} className="text-gray-400" />
                      <p className="font-medium">{formatDate(listing.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Health Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {listing.vaccinated && <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Vaccinated</Badge>}
                  {listing.microchipped && <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Microchipped</Badge>}
                  {listing.health_certificate && <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Health Certificate</Badge>}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-4">
              <div className="space-y-3">
                <Button 
                  onClick={handleContact}
                  className="w-full bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 text-white"
                  size="lg"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Contact Seller
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg">
                    Schedule Visit
                  </Button>
                  <Button variant="outline" size="lg">
                    Ask Question
                  </Button>
                </div>
              </div>
            </Card>

            {/* Seller Info */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.seller.avatar} />
                  <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{listing.seller.name}</h3>
                    {listing.seller.verified && (
                      <Badge variant="verified" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span>{listing.seller.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{listing.seller.reviews_count} reviews</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* About Section - Collapsible on Desktop for Compact View */}
            <Collapsible open={isAboutOpen} onOpenChange={setIsAboutOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full p-4 justify-between">
                    <span className="font-semibold">About {listing.dog_name}</span>
                    {isAboutOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 leading-relaxed">{listing.description}</p>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm">
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.dog_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 px-1">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-1 aspect-square max-w-16 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-[#2C3EDC]' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${listing.dog_name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Info */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.dog_name}</h1>
                <div className="text-2xl font-bold text-[#2C3EDC] mb-3">
                  ${listing.price.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Breed</span>
                  <p className="font-medium">{listing.breed}</p>
                </div>
                <div>
                  <span className="text-gray-500">Age</span>
                  <p className="font-medium">{listing.age} weeks</p>
                </div>
                <div>
                  <span className="text-gray-500">Location</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    <p className="font-medium text-xs">{listing.location}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Listed</span>
                  <p className="font-medium">{formatDate(listing.created_at)}</p>
                </div>
              </div>

              {/* Health Badges */}
              <div className="flex flex-wrap gap-1">
                {listing.vaccinated && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">✓ Vaccinated</Badge>}
                {listing.microchipped && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">✓ Microchipped</Badge>}
                {listing.health_certificate && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">✓ Health Cert</Badge>}
              </div>
            </div>
          </Card>

          {/* Seller Info - Collapsible */}
          <Collapsible open={isSellerInfoOpen} onOpenChange={setIsSellerInfoOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-4 justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={listing.seller.avatar} />
                      <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{listing.seller.name}</span>
                        {listing.seller.verified && (
                          <Badge variant="verified" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span>{listing.seller.rating} • {listing.seller.reviews_count} reviews</span>
                      </div>
                    </div>
                  </div>
                  {isSellerInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    Experienced breeder in {listing.seller.location} with excellent reviews and verified credentials.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* About - Collapsible */}
          <Collapsible open={isAboutOpen} onOpenChange={setIsAboutOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-4 justify-between">
                  <span className="font-semibold">About {listing.dog_name}</span>
                  {isAboutOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Bottom spacing for floating button */}
          <div className="h-20" />
        </div>
      </div>

      {/* Floating Contact Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="flex gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavorite}
              className={isFavorited ? "text-red-500 border-red-500" : ""}
            >
              <Heart size={20} className={isFavorited ? "fill-red-500" : ""} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <Share2 size={20} />
            </Button>
          </div>
          <Button 
            onClick={handleContact}
            className="flex-1 bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 text-white"
          >
            <MessageCircle size={20} className="mr-2" />
            Contact Seller
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
