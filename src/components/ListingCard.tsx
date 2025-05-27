
import React, { useState } from 'react';
import { Star, MapPin, MessageCircle, Award, Clock, Shield, Stethoscope, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WishlistButton from '@/components/features/WishlistButton';
import ReportButton from '@/components/features/ReportButton';
import RippleButton from '@/components/ui/ripple-button';

interface Listing {
  id: number;
  title: string;
  price: string;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  rating: number;
  reviews: number;
  image: string;
  breeder: string;
  verified: boolean;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available: number;
  sourceType: string;
  isKillShelter?: boolean;
}

interface ListingCardProps {
  listing: Listing;
  viewMode: 'grid' | 'list';
  onFavorite: (id: number) => void;
  onContact: (id: number) => void;
  onViewDetails: (id: number) => void;
  isFavorited?: boolean;
}

const ListingCard = ({ listing, viewMode, onFavorite, onContact, onViewDetails, isFavorited = false }: ListingCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(listing.id);
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border-gray-200 mb-4">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={listing.image}
              alt={listing.title}
              className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
            <div className="absolute top-2 right-2 flex gap-1">
              <WishlistButton
                listingId={listing.id}
                listingTitle={listing.title}
                isFavorited={isFavorited}
                onToggleFavorite={onFavorite}
              />
              <ReportButton listingId={listing.id} listingTitle={listing.title} />
            </div>
          </div>
          
          <CardContent className="flex-1 p-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{listing.title}</h3>
                  <p className="text-xl font-bold text-gray-900">{listing.price}</p>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {listing.location} • {listing.distance}
                  </div>
                  <div className="flex gap-4">
                    <span>Breed: {listing.breed}</span>
                    <span>Age: {listing.age}</span>
                    <span>Gender: {listing.gender}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-royal-blue fill-current" />
                      <span className="text-sm text-gray-600">{listing.rating} ({listing.reviews})</span>
                    </div>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{listing.available} available</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <RippleButton 
                      onClick={handleContact}
                      variant="outline" 
                      size="sm" 
                      className="bg-white border-gray-200 text-royal-blue hover:bg-soft-sky"
                    >
                      <MessageCircle size={14} />
                    </RippleButton>
                    <RippleButton 
                      onClick={() => onViewDetails(listing.id)}
                      className="bg-soft-sky text-royal-blue hover:bg-royal-blue hover:text-white" 
                      size="sm"
                    >
                      View Details
                    </RippleButton>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border-gray-200" onClick={() => onViewDetails(listing.id)}>
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className={`w-full h-48 object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <WishlistButton
            listingId={listing.id}
            listingTitle={listing.title}
            isFavorited={isFavorited}
            onToggleFavorite={onFavorite}
          />
          <ReportButton listingId={listing.id} listingTitle={listing.title} />
        </div>
        
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {listing.verified && (
            <Badge className="bg-blue-500 text-white text-xs">
              Verified
            </Badge>
          )}
          {listing.sourceType === "breeder" && listing.verifiedBreeder && (
            <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
              <Award size={10} />
              Breeder
            </Badge>
          )}
          {listing.sourceType === "shelter" && (
            <Badge className={`text-white text-xs flex items-center gap-1 ${listing.isKillShelter ? 'bg-red-500' : 'bg-purple-500'}`}>
              <Heart size={10} />
              {listing.isKillShelter ? 'Kill Shelter' : 'No-Kill Shelter'}
            </Badge>
          )}
        </div>

        {listing.available <= 2 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
              <Clock size={10} />
              Only {listing.available} left
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 bg-white">
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">{listing.price}</p>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {listing.location} • {listing.distance}
            </div>
            <div>Source: {listing.sourceType === "breeder" ? "Breeder" : "Shelter"}</div>
            <div>Breed: {listing.breed}</div>
            <div>Color: {listing.color} • Gender: {listing.gender}</div>
            <div>Age: {listing.age}</div>
          </div>

          <div className="flex flex-wrap gap-1 pt-1">
            {listing.idVerified && (
              <Badge variant="outline" className="text-xs border-gray-200 flex items-center gap-1">
                <Shield size={10} />
                ID Verified
              </Badge>
            )}
            {listing.vetVerified && (
              <Badge variant="outline" className="text-xs border-gray-200 flex items-center gap-1">
                <Stethoscope size={10} />
                Vet Licensed
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-royal-blue fill-current" />
              <span className="text-sm text-gray-600">{listing.rating} ({listing.reviews})</span>
            </div>
            <span className="text-sm text-gray-600">{listing.available} available</span>
          </div>

          <div className="flex gap-2 pt-2">
            <RippleButton 
              onClick={() => onViewDetails(listing.id)}
              className="flex-1 bg-soft-sky text-royal-blue hover:bg-royal-blue hover:text-white border-0" 
              size="sm"
            >
              View Details
            </RippleButton>
            <RippleButton 
              onClick={handleContact}
              variant="outline" 
              size="sm" 
              className="bg-white border-gray-200 text-royal-blue hover:bg-soft-sky hover:text-royal-blue hover:border-gray-200"
            >
              <MessageCircle size={16} />
            </RippleButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
