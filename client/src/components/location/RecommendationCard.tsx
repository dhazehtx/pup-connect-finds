
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Heart } from 'lucide-react';

interface RecommendationCardProps {
  listing: any;
  categoryId: string;
}

const RecommendationCard = ({ listing, categoryId }: RecommendationCardProps) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <img
          src={listing.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
          alt={listing.dog_name}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1">
          <h4 className="font-medium">{listing.dog_name}</h4>
          <p className="text-sm text-gray-600">{listing.breed}</p>
          <p className="text-lg font-bold">${listing.price?.toLocaleString()}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {listing.formattedDistance && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.formattedDistance}
              </span>
            )}
            
            {categoryId === 'top-rated' && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {listing.rating?.toFixed(1)}
              </span>
            )}
            
            {categoryId === 'popular' && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {listing.views} views
              </span>
            )}
            
            {categoryId === 'favorites' && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {listing.favorites} ❤️
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button size="sm" className="flex-1">Contact</Button>
        <Button size="sm" variant="outline" className="flex-1">Details</Button>
      </div>
    </div>
  );
};

export default RecommendationCard;
