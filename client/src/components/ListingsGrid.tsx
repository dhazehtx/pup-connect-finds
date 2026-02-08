import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useListings } from '@/hooks/useListings';

export default function ListingsGrid() {
  const navigate = useNavigate();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useListings();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allListings = data?.pages.flat() || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error loading listings. Please try again.</p>
      </div>
    );
  }

  if (allListings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No puppies found matching your filters.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/listing/${listing.id}`)}>
            <div className="relative aspect-square">
              <img
                src={listing.image_url || '/api/placeholder/300/300'}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/300/300';
                }}
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                ${listing.price.toLocaleString()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 text-gray-900">{listing.dog_name}</h3>
              <p className="text-sm text-gray-600 mb-1">{listing.breed}</p>
              <p className="text-sm text-gray-600 mb-1">
                {listing.age} {listing.age === 1 ? 'month' : 'months'} old • {listing.gender}
              </p>
              {listing.color && (
                <p className="text-sm text-gray-600 mb-1">{listing.color}</p>
              )}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </div>
              
              {/* Status badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {(listing as any).verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Verified
                  </span>
                )}
                {(listing as any).health_checked && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Health Checked
                  </span>
                )}
                {(listing as any).vaccinated && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    Vaccinated
                  </span>
                )}
              </div>

              {listing.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8">
        {isFetchingNextPage && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading more puppies...
            </div>
          </div>
        )}
        {!hasNextPage && allListings.length > 0 && (
          <div className="text-center text-gray-500 text-sm">
            You've seen all available puppies!
          </div>
        )}
      </div>
    </div>
  );
}