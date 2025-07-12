
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, MessageCircle, MapPin, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSocialShare } from '@/hooks/useSocialShare';
import { supabase } from '@/integrations/supabase/client';
import AnimatedHeart from '@/components/ui/animated-heart';
import ContactSellerButton from '@/components/messaging/ContactSellerButton';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description?: string;
  image_url?: string;
  images?: string[];
  location?: string;
  gender?: string;
  size?: string;
  color?: string;
  vaccinated?: boolean;
  neutered_spayed?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  special_needs?: boolean;
  delivery_available?: boolean;
  created_at: string;
  user_id?: string;
  profiles?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
    verified?: boolean;
  };
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { copyToClipboard, nativeShare, canNativeShare } = useSocialShare();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      if (user) {
        checkFavoriteStatus();
      }
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url,
            rating,
            total_reviews,
            verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single();
      
      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite or error - assume false
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings",
      });
      navigate('/auth');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your saved items",
        });
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, listing_id: id }]);
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Listing saved to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!listing) return;

    const shareData = {
      title: `${listing.dog_name} - ${listing.breed}`,
      description: `Check out this adorable ${listing.breed} puppy for $${listing.price.toLocaleString()}!`,
      url: window.location.href
    };

    if (canNativeShare) {
      await nativeShare(shareData);
    } else {
      await copyToClipboard(shareData);
    }
  };

  const formatAge = (age: number) => {
    if (age < 12) {
      return `${age} week${age !== 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(age / 4);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to listings
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = listing.image_url || (listing.images && listing.images[0]);
  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {currentImage ? (
              <img
                src={currentImage}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {listing.dog_name}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="text-lg">{listing.breed}</span>
                <span>•</span>
                <span>{formatAge(listing.age)} old</span>
                {listing.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-3xl font-bold text-primary mb-6">
                ${listing.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <AnimatedHeart
              isLiked={isFavorite}
              onToggle={toggleFavorite}
              disabled={favoriteLoading}
              className="p-3 border rounded-lg hover:bg-accent"
            />
            
            <ContactSellerButton
              listingId={listing.id}
              sellerId={listing.user_id || ''}
              className="flex-1 bg-royal-blue hover:bg-royal-blue/90 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Seller
            </ContactSellerButton>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="px-6"
              title="Share this listing"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Separator />

          {/* Seller Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <button
                    onClick={() => navigate(`/profile/${listing.profiles?.id}`)}
                    className="text-lg font-semibold hover:text-primary transition-colors text-left"
                  >
                    {listing.profiles?.full_name || 'Unknown Seller'}
                  </button>
                  {listing.profiles?.username && (
                    <p className="text-muted-foreground">@{listing.profiles.username}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {listing.profiles?.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    {listing.profiles?.rating && (
                      <span className="text-sm text-muted-foreground">
                        ⭐ {listing.profiles.rating.toFixed(1)} ({listing.profiles.total_reviews || 0} reviews)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* About Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">About {listing.dog_name}</h2>
            
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {listing.gender && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{listing.gender}</p>
                </div>
              )}
              {listing.size && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium capitalize">{listing.size}</p>
                </div>
              )}
              {listing.color && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium capitalize">{listing.color}</p>
                </div>
              )}
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{formatAge(listing.age)}</p>
              </div>
            </div>

            {/* Health & Behavior */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Health & Behavior</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${listing.vaccinated ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Vaccinated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${listing.neutered_spayed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Spayed/Neutered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${listing.good_with_kids ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Good with kids</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${listing.good_with_dogs ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Good with dogs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${listing.delivery_available ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Delivery available</span>
                </div>
                {listing.special_needs && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Special needs</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No reviews yet for this seller</p>
              <p className="text-sm mt-1">Be the first to leave a review after your purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
