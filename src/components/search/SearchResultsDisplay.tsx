
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsDisplayProps {
  activeTab: 'search' | 'recommendations' | 'trending';
  searchResults: any[];
  recommendations: any[];
  trendingListings: any[];
  loading: boolean;
  onInteraction: (type: string, listingId: string) => void;
}

const SearchResultsDisplay = ({
  activeTab,
  searchResults,
  recommendations,
  trendingListings,
  loading,
  onInteraction
}: SearchResultsDisplayProps) => {
  const getDisplayData = () => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'recommendations':
        return recommendations;
      case 'trending':
        return trendingListings;
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'search':
        return 'Search Results';
      case 'recommendations':
        return 'Recommended for You';
      case 'trending':
        return 'Trending Listings';
      default:
        return 'Results';
    }
  };

  const data = getDisplayData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading {getTitle().toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No {getTitle().toLowerCase()} found</p>
          <p className="text-sm">Try adjusting your search criteria or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
        <Badge variant="secondary">
          {data.length} result{data.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => {
          // Handle different data structures
          const listing = item.listing || item;
          const score = item.relevance_score || item.confidence_score;
          const reasons = item.reasons || [];

          return (
            <Card key={listing.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {listing.image_url && (
                  <div className="aspect-square w-full bg-gray-100">
                    <img
                      src={listing.image_url}
                      alt={listing.dog_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Score Badge */}
                {score && (
                  <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                    {Math.round(score * 100)}% match
                  </div>
                )}

                {/* Favorite Button */}
                <button 
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  onClick={() => onInteraction('favorite', listing.id)}
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
                    <p className="text-gray-600">{listing.breed}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-green-600">
                      ${listing.price?.toLocaleString()}
                    </span>
                    {listing.age && (
                      <Badge variant="secondary">
                        {listing.age} months
                      </Badge>
                    )}
                  </div>

                  {listing.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location}
                    </div>
                  )}

                  {/* Reasons for recommendation */}
                  {reasons.length > 0 && (
                    <div className="space-y-1">
                      {reasons.slice(0, 2).map((reason: string, idx: number) => (
                        <p key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Seller info */}
                  {listing.profiles && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {listing.profiles.full_name || 'Seller'}
                      </span>
                      {listing.profiles.verified && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => onInteraction('view', listing.id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onInteraction('contact', listing.id)}
                    >
                      Contact
                    </Button>
                  </div>

                  {/* Timestamp for trending */}
                  {activeTab === 'trending' && listing.created_at && (
                    <p className="text-xs text-gray-500">
                      Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResultsDisplay;
