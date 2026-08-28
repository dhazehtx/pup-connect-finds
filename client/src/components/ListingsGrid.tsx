import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { EXPLORE_DEFAULT_FILTERS, useExploreFilters } from '@/context/ExploreFiltersContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

export default function ListingsGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setFilters } = useExploreFilters();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useListings();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      try {
        const data = await apiRequest(`/api/favorites/ids/${user.id}`);
        if (data?.ids) {
          setFavorites(new Set(data.ids));
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    fetchFavorites();
    // Key on the user id, not the object, so the one-time AuthContext user-ref
    // change during init doesn't double-fetch /api/favorites/ids.
  }, [user?.id]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save listings.', variant: 'destructive' });
      navigate('/greeting');
      return;
    }
    if (togglingIds.has(listingId)) return;

    setTogglingIds(prev => new Set(prev).add(listingId));
    const wasFavorited = favorites.has(listingId);

    setFavorites(prev => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      if (wasFavorited) {
        await apiRequest(`/api/favorites/${user.id}/${listingId}`, { method: 'DELETE' });
        toast({ title: 'Removed from favorites' });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: { user_id: user.id, listing_id: listingId },
        });
        toast({ title: 'Added to favorites' });
      }
    } catch (err: any) {
      setFavorites(prev => {
        const next = new Set(prev);
        if (wasFavorited) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
      toast({ title: 'Error', description: 'Failed to update favorites', variant: 'destructive' });
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }, [user, favorites, togglingIds, toast, navigate]);

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
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/50 dark:text-blue-400">
          <Dog className="h-12 w-12" strokeWidth={1.5} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Searching for your perfect match...
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Try widening your filters or reset to see more puppies.
        </p>
        <Button
          type="button"
          className="mt-6 bg-blue-600 hover:bg-blue-700"
          onClick={() => setFilters(structuredClone(EXPLORE_DEFAULT_FILTERS))}
        >
          Reset all filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allListings.map((listing) => {
          const isFav = favorites.has(listing.id);
          return (
            <Card
              key={listing.id}
              className="cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              <div className="relative aspect-square">
                <img
                  src={listing.thumbUrls?.[0] || listing.image_url || '/api/placeholder/300/300'}
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
                  className={`absolute top-2 right-2 rounded-full w-8 h-8 p-0 ${isFav ? 'bg-red-50 hover:bg-red-100' : 'bg-white/90 hover:bg-white'}`}
                  disabled={togglingIds.has(listing.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(listing.id);
                  }}
                >
                  <Heart
                    className="w-4 h-4 transition-colors"
                    fill={isFav ? "#ef4444" : "none"}
                    stroke={isFav ? "#ef4444" : "#9ca3af"}
                  />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-900">{listing.dog_name}</h3>
                <p className="text-sm text-gray-600 mb-1">{listing.breed}</p>
                <p className="text-sm text-gray-600 mb-1">
                  {listing.age} {listing.age === 1 ? 'week' : 'weeks'} old • {listing.gender}
                </p>
                {listing.color && (
                  <p className="text-sm text-gray-600 mb-1">{listing.color}</p>
                )}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  {listing.location}
                </div>
                
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
          );
        })}
      </div>

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
