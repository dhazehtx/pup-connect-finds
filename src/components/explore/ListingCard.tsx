
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: {
    id: string;
    dog_name: string;
    breed: string;
    age: number;
    price: number;
    location?: string;
    image_url?: string;
    user_id?: string;
    profiles?: {
      full_name: string;
      verified: boolean;
      rating?: number;
    };
  };
  className?: string;
}

const ListingCard = ({ listing, className = '' }: ListingCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            listing_id: listing.id
          }]);
        setIsFavorited(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
      });
      navigate('/auth');
      return;
    }

    if (user.id === listing.user_id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    // Navigate to messages with the listing context
    navigate(`/messages?contact=${listing.user_id}&listing=${listing.id}`);
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-blue-200 hover:border-blue-300 bg-white ${className}`}>
      <div className="relative" onClick={handleViewDetails}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={listing.image_url || '/placeholder.svg'}
            alt={listing.dog_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        
        {/* Favorite Button */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white ${
            isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-700'
          }`}
          onClick={toggleFavorite}
          disabled={loading}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-blue-600 border-white/50 backdrop-blur-sm font-semibold">
            ${listing.price.toLocaleString()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {listing.dog_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                {listing.breed}
              </Badge>
              <span className="text-sm text-gray-500">
                {listing.age} {listing.age === 1 ? 'month' : 'months'} old
              </span>
            </div>
          </div>

          {listing.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{listing.location}</span>
            </div>
          )}

          {/* Seller Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-blue-600 font-medium">
                  {listing.profiles?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-600 truncate">
                {listing.profiles?.full_name || 'Seller'}
              </span>
              {listing.profiles?.verified && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  ✓
                </Badge>
              )}
            </div>
            
            {listing.profiles?.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">
                  {listing.profiles.rating}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleContact}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
