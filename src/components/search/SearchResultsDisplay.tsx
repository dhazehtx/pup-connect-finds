
import React from 'react';
import { Heart, MapPin, Calendar, DollarSign, Eye, Share2, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        return { data: searchResults, title: 'Search Results' };
      case 'recommendations':
        return { data: recommendations, title: 'Personalized Recommendations' };
      case 'trending':
        return { data: trendingListings, title: 'Trending Dogs' };
      default:
        return { data: [], title: '' };
    }
  };

  const { data, title } = getDisplayData();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐕</div>
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          {activeTab === 'search' 
            ? "Try adjusting your search terms or filters"
            : activeTab === 'recommendations'
            ? "Browse more listings to get personalized recommendations"
            : "No trending listings available at the moment"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-muted-foreground">{data.length} results</span>
      </div>

      <div className="grid gap-4">
        {data.map((item, index) => {
          const listing = activeTab === 'search' ? item.listing : item;
          const confidence = activeTab === 'recommendations' ? item.confidence_score : null;
          const reasons = activeTab === 'recommendations' ? item.reasoning : [];

          return (
            <Card key={listing?.id || index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={listing?.image_url || '/placeholder.svg'}
                      alt={listing?.dog_name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    {confidence && (
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        {Math.round(confidence * 100)}% match
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{listing?.dog_name}</h3>
                        <p className="text-muted-foreground">{listing?.breed}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-green-600">
                          ${listing?.price?.toLocaleString()}
                        </p>
                        {activeTab === 'trending' && item.interaction_count && (
                          <Badge variant="secondary">
                            {item.interaction_count} views this week
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {listing?.age} weeks old
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing?.location}
                      </div>
                    </div>

                    {/* Breeder Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={listing?.profiles?.avatar_url} />
                        <AvatarFallback>
                          {listing?.profiles?.full_name?.charAt(0) || 'B'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{listing?.profiles?.full_name}</p>
                        {listing?.profiles?.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>

                    {/* Recommendation Reasons */}
                    {reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reasons.slice(0, 3).map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {listing?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        onClick={() => onInteraction('view', listing?.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onInteraction('favorite', listing?.id)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onInteraction('contact', listing?.id)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onInteraction('share', listing?.id)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
