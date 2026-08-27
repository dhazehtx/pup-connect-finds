import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart, MapPin, Calendar, Ruler, Award, PawPrint, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { WhyTrustProviderPanel } from '@/components/trust/WhyTrustProviderPanel';
import { Link } from 'react-router-dom';

type ListingDetailData = {
  id: string;
  user_id: string;
  dog_name: string;
  breed: string;
  price: number;
  age?: number;
  location?: string;
  size?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  vaccinated?: boolean;
  neutered_spayed?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  profiles?: Record<string, any>;
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
    setCurrentImageIndex(0);
  }, [id]);

  // Fetch the listing whenever the id changes. Intentionally keyed on `id` ONLY:
  // auth (`user`) resolving or its token auto-refreshing after mount must NOT
  // re-run this and flash the skeleton back over already-rendered content (that
  // was the client-side-navigation regression). The viewer-specific favourite
  // check lives in its own effect below and never toggles the page skeleton.
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "No listing ID provided",
          variant: "destructive",
        });
        navigate('/explore');
        return;
      }

      try {
        setLoading(true);
        const listingData = await apiRequest(`/api/listings/${id}`);

        if (!listingData) {
          // Leave `listing` null and render the in-page "Listing not found" state
          // below — a useful not-found experience instead of a silent redirect.
          document.title = 'Listing not found — PAWS';
          return;
        }

        setListing(listingData);
        if (listingData?.dog_name) {
          document.title = `${listingData.dog_name} — PAWS`;
        }
      } catch (error: any) {
        console.error('Error:', error);
        // A load error (incl. a 404 from apiRequest throwing) also falls through to
        // the in-page not-found state rather than silently redirecting away.
        document.title = 'Listing not found — PAWS';
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
    // Keyed on `id` only — see comment above (auth changes must not reset the skeleton).
  }, [id]);

  // Favourite status depends on the viewer; updating it must not toggle the
  // page-level `loading`/skeleton. Re-runs safely when the id or user changes.
  useEffect(() => {
    if (!id || !user) {
      setIsFavorited(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const favData = await apiRequest(`/api/favorites/check/${id}`);
        if (!cancelled) setIsFavorited(favData?.isFavorited ?? false);
      } catch (favError) {
        console.error('Unexpected error checking favorite status:', favError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleShare = async () => {
    if (!listing) {
      toast({
        title: "Error",
        description: "Unable to share - listing data not loaded",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const url = window.location.href;
      const title = `${listing.dog_name} - ${listing.breed}`;
      const text = `Check out this adorable ${listing.breed} puppy looking for a forever home! Only $${listing.price}`;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (shareError) {
          // Native share cancelled or failed, fall through to clipboard
        }
      }

      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The listing link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Share completely failed:', error);
      toast({
        title: "Share failed",
        description: "Unable to share the listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings",
        variant: "destructive",
      });
      return;
    }

    if (!listing || isFavoriteLoading) return;

    setIsFavoriteLoading(true);
    const prevState = isFavorited;
    setIsFavorited(!prevState);

    try {
      if (prevState) {
        await apiRequest(`/api/favorites/${user.id}/${listing.id}`, { method: 'DELETE' });
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your favorites",
        });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: { user_id: user.id, listing_id: listing.id },
        });
        toast({
          title: "Added to favorites",
          description: "Listing saved to your favorites",
        });
      }
    } catch (error: any) {
      if (error?.code === '23505') {
        setIsFavorited(true);
      } else {
        setIsFavorited(prevState);
        console.error('Error updating favorite:', error);
        toast({
          title: "Error",
          description: "Failed to update favorites",
          variant: "destructive",
        });
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!listing) {
      toast({ title: "Error", description: "Listing data not available", variant: "destructive" });
      return;
    }

    // Guest: never silently no-op — send them to sign in and return to this listing.
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to contact sellers" });
      navigate(`/auth?next=${encodeURIComponent(`/listing/${id}`)}`);
      return;
    }

    if (listing.user_id === user.id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    // Create-or-find the thread and go DIRECTLY to it (no inbox hop). The thread
    // view loads its own messages, so the conversation is immediately visible.
    try {
      const result = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { targetUserId: listing.user_id, listing_id: listing.id },
      });
      const conversationId = result?.conversationId || result?.id;
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      } else {
        toast({
          title: "Messaging unavailable",
          description: `Could not start the conversation (${result?.code || 'UNKNOWN'}).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[ContactSeller] error', error);
      toast({
        title: "Messaging unavailable",
        description: "Could not start the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextImage = () => {
    const listingImages = listing?.images;
    if (!listingImages?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % listingImages.length);
  };

  const prevImage = () => {
    const listingImages = listing?.images;
    if (!listingImages?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + listingImages.length) % listingImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/90 pb-24">
        <div className="mx-auto max-w-4xl space-y-6 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded bg-slate-200" />
            <div className="aspect-video rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              <div className="h-6 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-1/4 rounded bg-slate-200" />
              <div className="h-12 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pb-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Listing not found</h1>
        <p className="max-w-md text-slate-600">It may have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate('/explore')}>Browse Explore</Button>
      </div>
    );
  }

  // Properly handle images - prefer the images array, fallback to single image_url
  const images = listing.images && listing.images.length > 0 ? listing.images : 
                 listing.image_url ? [listing.image_url] : [];
  
  const seller = listing.profiles || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/90 to-white pb-24">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/explore');
            }
          }}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Listing</p>
          <h1 className="text-xl font-semibold text-slate-900">Meet {listing.dog_name}</h1>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="aspect-[4/3] bg-slate-100 sm:aspect-video">
          {images.length > 0 && !imageBroken ? (
            <img
              src={images[currentImageIndex]}
              alt={`${listing.dog_name} — photo ${currentImageIndex + 1}`}
              className="h-full w-full object-cover"
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <PawPrint className="h-14 w-14 opacity-40" aria-hidden />
              <span className="text-sm font-medium">Photo unavailable</span>
            </div>
          )}
        </div>
        
        {images.length > 1 && !imageBroken && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 shadow-sm hover:bg-white"
              onClick={prevImage}
              type="button"
              aria-label="Previous photo"
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 shadow-sm hover:bg-white"
              onClick={nextImage}
              type="button"
              aria-label="Next photo"
            >
              <ArrowLeft size={16} className="rotate-180" />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{listing.dog_name}</h2>
          <p className="text-lg text-slate-600">{listing.breed}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar size={16} aria-hidden />
              {listing.age != null ? `${listing.age} weeks old` : 'Age on request'}
            </div>
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {listing.location}
              </div>
            )}
            {listing.size && (
              <div className="flex items-center gap-1">
                <Ruler size={16} />
                {listing.size}
              </div>
            )}
          </div>
        </div>

        <div className="text-3xl font-bold text-royal-blue">
          ${listing.price?.toLocaleString()}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            disabled={isFavoriteLoading}
            onClick={() => handleFavorite()}
            className={`transition-colors ${isFavorited ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Heart className="h-5 w-5 transition-colors" fill={isFavorited ? "#ef4444" : "none"} stroke={isFavorited ? "#ef4444" : "#9ca3af"} />
          </Button>
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContactSeller();
            }}
            className="min-h-[44px] flex-1 bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700"
            disabled={!listing || !listing.user_id}
          >
            Contact Seller
          </Button>
          
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
            className="flex items-center gap-2"
            title="Share this listing"
            disabled={!listing}
          >
            <Share size={16} />
            Share
          </Button>
        </div>

        {/* Features */}
        {(listing.vaccinated || listing.neutered_spayed || listing.good_with_kids || listing.good_with_dogs) && (
          <div className="flex flex-wrap gap-2">
            {listing.vaccinated && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Vaccinated
              </Badge>
            )}
            {listing.neutered_spayed && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Spayed/Neutered
              </Badge>
            )}
            {listing.good_with_kids && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Good with Kids
              </Badge>
            )}
            {listing.good_with_dogs && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award size={12} />
                Good with Dogs
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Seller Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={seller.avatar_url} />
              <AvatarFallback>{seller.full_name?.charAt(0) || seller.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">{seller.full_name || seller.username || 'Unknown User'}</h3>
                {seller.verified && (
                  <Badge variant="default" className="bg-blue-600 text-white hover:bg-blue-600">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {seller.rating != null && (
                  <span>★ {seller.rating} ({seller.total_reviews || 0} reviews)</span>
                )}
                {seller.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {seller.location}
                  </span>
                )}
                {seller.created_at && (
                  <span>📅 Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${seller.id}`)}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {seller.id && (
        <WhyTrustProviderPanel
          seller={{
            id: seller.id,
            full_name: seller.full_name,
            username: seller.username,
            avatar_url: seller.avatar_url,
            verified: seller.verified,
            rating: seller.rating,
            total_reviews: seller.total_reviews,
            user_type: seller.user_type,
          }}
        />
      )}

      {/* About Section */}
      {listing.description && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">About {listing.dog_name}</h3>
            <p className="leading-relaxed text-slate-700">{listing.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Continue browsing</h3>
            <p className="mt-1 text-sm text-slate-600">
              Explore more puppies and connect with verified sellers on PAWS.
            </p>
          </div>
          <Button variant="default" className="min-h-[44px] shrink-0 bg-royal-blue hover:bg-royal-blue/90" asChild>
            <Link to="/explore" className="inline-flex items-center gap-1">
              Go to Explore
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ListingDetail;
