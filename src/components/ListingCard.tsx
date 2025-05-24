
import React from 'react';
import { Star, MapPin, Heart, MessageCircle, Phone, Mail, Shield, Camera, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface Listing {
  id: number;
  title: string;
  price: string;
  adoptionFee: boolean;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  genetics: string[];
  rating: number;
  reviews: number;
  images: string[];
  videos: string[];
  breeder: {
    name: string;
    profilePicture: string;
    phone: string;
    email: string;
  };
  verified: boolean;
  available: number;
  vaccinations: {
    status: string;
    details: string[];
  };
  healthHistory: string;
  dnaTests: string[];
  healthTests: string[];
}

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        {/* Image Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {listing.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-72 overflow-hidden rounded-2xl mx-3 my-3">
                  <img
                    src={image}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover object-center rounded-2xl shadow-md"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {listing.images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>

        {/* Overlays */}
        <button className="absolute top-6 right-6 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg">
          <Heart size={16} className="text-gray-600" />
        </button>
        
        {listing.verified && (
          <Badge className="absolute top-6 left-6 bg-blue-500 text-white shadow-lg">
            <Shield size={12} className="mr-1" />
            Verified
          </Badge>
        )}

        {/* Media indicators */}
        <div className="absolute bottom-6 left-6 flex gap-1">
          {listing.images.length > 1 && (
            <Badge variant="secondary" className="text-xs shadow-lg">
              <Camera size={10} className="mr-1" />
              {listing.images.length}
            </Badge>
          )}
          {listing.videos.length > 0 && (
            <Badge variant="secondary" className="text-xs shadow-lg">
              <Video size={10} className="mr-1" />
              {listing.videos.length}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">{listing.title}</h3>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{listing.price}</p>
              {listing.adoptionFee && (
                <Badge variant="outline" className="text-xs mt-1">Rescue</Badge>
              )}
            </div>
          </div>

          {/* Breeder Info */}
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={listing.breeder.profilePicture} alt={listing.breeder.name} />
              <AvatarFallback>{listing.breeder.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{listing.breeder.name}</p>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-500 fill-current" />
                <span className="text-xs text-gray-600">{listing.rating} ({listing.reviews})</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Phone size={14} />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Mail size={14} />
              </Button>
            </div>
          </div>

          {/* Pet Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Breed:</strong> {listing.breed}</div>
            <div><strong>Age:</strong> {listing.age}</div>
            <div><strong>Gender:</strong> {listing.gender}</div>
            <div><strong>Color:</strong> {listing.color}</div>
          </div>

          {/* Health Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-600" />
              <span className="text-sm font-medium">Health Status</span>
            </div>
            <div className="ml-6 space-y-1 text-sm">
              <div><strong>Vaccinations:</strong> {listing.vaccinations.status}</div>
              <div className="text-xs text-gray-600">
                {listing.vaccinations.details.join(", ")}
              </div>
              {listing.healthHistory && (
                <div><strong>Health:</strong> {listing.healthHistory}</div>
              )}
              {listing.dnaTests.length > 0 && (
                <div><strong>DNA Tests:</strong> {listing.dnaTests.join(", ")}</div>
              )}
              {listing.healthTests.length > 0 && (
                <div><strong>Health Tests:</strong> {listing.healthTests.join(", ")}</div>
              )}
            </div>
          </div>

          {/* Genetics (for applicable breeds) */}
          {listing.genetics.length > 0 && (
            <div>
              <strong className="text-sm">Genetics:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {listing.genetics.map((genetic) => (
                  <Badge key={genetic} variant="outline" className="text-xs">
                    {genetic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            {listing.location} • {listing.distance}
          </div>

          {/* Contact Details */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Phone size={12} />
                <span>{listing.breeder.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} />
                <span className="text-blue-600">{listing.breeder.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" size="sm">
              View Details
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle size={16} />
            </Button>
            <Button variant="outline" size="sm">
              <Heart size={16} />
            </Button>
          </div>

          {/* Availability */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {listing.available} available
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
