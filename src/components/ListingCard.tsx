
import React from 'react';
import { Heart, MessageCircle, MapPin, Star, Shield, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RippleButton from '@/components/ui/ripple-button';
import AnimatedHeart from '@/components/ui/animated-heart';
import UserVerificationBadge from '@/components/features/UserVerificationBadge';
import ListingActions from '@/components/listings/ListingActions';
import { useAuth } from '@/contexts/AuthContext';
import GuestPrompt from '@/components/GuestPrompt';
import { useState } from 'react';

interface ListingCardProps {
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
  isFavorited: boolean;
  onFavorite: (id: number) => void;
  onContact: (id: number) => void;
  onViewDetails: (id: number) => void;
  viewMode?: 'grid' | 'list';
  showEnhancedActions?: boolean;
}

const ListingCard = ({
  id,
  title,
  price,
  location,
  distance,
  breed,
  color,
  gender,
  age,
  rating,
  reviews,
  image,
  breeder,
  verified,
  verifiedBreeder = false,
  idVerified = false,
  vetVerified = false,
  available,
  sourceType,
  isKillShelter = false,
  isFavorited,
  onFavorite,
  onContact,
  onViewDetails,
  viewMode = 'grid',
  showEnhancedActions = false
}: ListingCardProps) => {
  const { user, isGuest } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  const handleFavorite = () => {
    if (!user) {
      setPromptAction('save favorites');
      setShowGuestPrompt(true);
      return;
    }
    onFavorite(id);
  };

  const handleContact = () => {
    if (!user) {
      setPromptAction('contact breeders');
      setShowGuestPrompt(true);
      return;
    }
    onContact(id);
  };

  const cardClasses = viewMode === 'list' 
    ? "flex flex-row"
    : "flex flex-col";

  const imageClasses = viewMode === 'list'
    ? "w-48 h-36"
    : "w-full h-48";

  const contentClasses = viewMode === 'list'
    ? "flex-1 p-4"
    : "p-4";

  // Determine verification level based on verification props
  const getVerificationLevel = () => {
    if (verifiedBreeder && idVerified && vetVerified) {
      return 'professional';
    } else if (verifiedBreeder && idVerified) {
      return 'premium';
    } else if (verifiedBreeder) {
      return 'basic';
    }
    return 'none';
  };

  return (
    <>
      <Card className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${cardClasses}`}>
        <div 
          className={`relative ${imageClasses} bg-gray-100 flex-shrink-0`}
          onClick={() => onViewDetails(id)}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className="absolute top-3 right-3 z-10"
          >
            <AnimatedHeart 
              isLiked={isFavorited} 
              onToggle={handleFavorite}
              size={24}
              className="text-white drop-shadow-lg"
            />
          </button>

          {/* Urgent badge for kill shelters */}
          {isKillShelter && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white">
              URGENT
            </Badge>
          )}

          {/* Available count badge */}
          {available > 1 && (
            <Badge className="absolute bottom-3 left-3 bg-black/70 text-white">
              {available} available
            </Badge>
          )}
        </div>

        <div className={contentClasses}>
          <div className="space-y-2 mb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-black leading-tight">{title}</h3>
              <span className="font-bold text-lg text-green-600 ml-2">{price}</span>
            </div>
            
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={14} className="mr-1" />
              <span>{location}</span>
              <span className="mx-2">•</span>
              <span>{distance}</span>
            </div>
          </div>

          <div className="space-y-2 mb-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Breed:</span>
              <span className="font-medium">{breed}</span>
            </div>
            <div className="flex justify-between">
              <span>Color:</span>
              <span>{color}</span>
            </div>
            <div className="flex justify-between">
              <span>Gender:</span>
              <span>{gender}</span>
            </div>
            <div className="flex justify-between">
              <span>Age:</span>
              <span>{age}</span>
            </div>
          </div>

          {/* Source type badge */}
          <div className="flex gap-2 mb-3">
            <Badge variant={sourceType === 'rescue' ? 'secondary' : 'outline'}>
              {sourceType}
            </Badge>
            {verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Breeder info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">by {breeder}</span>
              <UserVerificationBadge 
                verificationLevel={getVerificationLevel()}
                rating={rating}
                totalReviews={reviews}
                className="ml-1"
              />
            </div>
            
            {reviews > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star size={14} className="text-yellow-400 mr-1" />
                <span>{rating}</span>
                <span className="mx-1">•</span>
                <span>{reviews} reviews</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {showEnhancedActions ? (
            <ListingActions
              listingId={id}
              title={title}
              price={price}
              sellerName={breeder}
              onContact={handleContact}
              onFavorite={handleFavorite}
              isFavorited={isFavorited}
            />
          ) : (
            <div className="flex gap-2">
              <RippleButton
                onClick={() => onViewDetails(id)}
                className="flex-1 bg-royal-blue hover:bg-royal-blue/90 text-white text-sm"
              >
                <Eye size={16} className="mr-1" />
                View Details
              </RippleButton>
              
              <RippleButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleContact();
                }}
                variant="outline"
                className="px-3 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
              >
                <MessageCircle size={16} />
              </RippleButton>
            </div>
          )}

          {/* Guest user notice */}
          {!user && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Sign in to contact breeders and save favorites
            </p>
          )}
        </div>
      </Card>

      {showGuestPrompt && (
        <GuestPrompt
          action={promptAction}
          description={`To ${promptAction}, you need to create a MY PUP account.`}
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}
    </>
  );
};

export default ListingCard;
