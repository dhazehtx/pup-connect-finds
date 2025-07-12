import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share, MessageCircle, Shield, MapPin, Calendar, ChevronDown, ChevronUp, Star, Mail } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSocialShare } from '@/hooks/useSocialShare';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { supabase } from '@/integrations/supabase/client';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { copyToClipboard, nativeShare, canNativeShare } = useSocialShare();
  const { createConversation } = useConversationsManager();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  useEffect(() => {
    if (user && listing) {
      checkIfFavorited();
    }
  }, [user, listing]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Listing not found');
        return;
      }

      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorited = async () => {
    if (!user || !listing) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .single();

      if (!error && data) {
        setIsFavorited(true);
      }
    } catch (error) {
      // Not favorited or error - keep as false
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
      });
      navigate('/auth');
      return;
    }

    if (!listing) return;

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your favorites",
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing.id
          });
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Listing saved to your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!listing) return;

    const url = window.location.href;
    const title = `${listing.dog_name} - ${listing.breed}`;
    const description = `${listing.dog_name} is a ${listing.age} month old ${listing.breed} looking for a loving home! Price: $${listing.price}`;
    
    const shareData = {
      title,
      description,
      url
    };

    try {
      if (canNativeShare) {
        // Mobile - use native share
        await nativeShare(shareData);
      } else {
        // Desktop - copy to clipboard
        await copyToClipboard(shareData);
      }
    } catch (error) {
      // Fallback for any errors
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Listing link copied to clipboard",
        });
      } catch (fallbackError) {
        toast({
          title: "Share failed",
          description: "Unable to share this listing",
          variant: "destructive",
        });
      }
    }
  };

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
      });
      navigate('/auth');
      return;
    }

    if (!listing) return;

    // Prevent users from contacting themselves
    if (user.id === listing.user_id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingConversation(true);
      
      // Create or get existing conversation
      const conversationId = await createConversation(listing.id, listing.user_id);
      
      if (conversationId) {
        // Navigate to messages with prefilled content
        const messageText = `Hi, I'm interested in your listing for ${listing.dog_name}!`;
        navigate(`/messages?conversation=${conversationId}&message=${encodeURIComponent(messageText)}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSellerClick = () => {
    if (listing?.profiles?.id) {
      navigate(`/profile/${listing.profiles.id}`);
    }
  };

  if (loading) {
    return <LoadingState message="Loading listing details..." />;
  }

  if (error || !listing) {
    return (
      <ErrorState 
        title="Listing not found"
        message={error || "The listing you're looking for doesn't exist or has been removed."}
        retryText="Back to Explore"
        onRetry={() => navigate('/explore')}
      />
    );
  }

  const healthBadges = [];
  if (listing.vaccinated) healthBadges.push('Vaccinated');
  if (listing.neutered_spayed) healthBadges.push('Spayed/Neutered');
  if (listing.good_with_kids) healthBadges.push('Good with Kids');
  if (listing.good_with_dogs) healthBadges.push('Good with Dogs');

  const aboutContent = listing.description || 'No additional information provided.';
  const shouldCollapseAbout = aboutContent.length > 300;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Image Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-square">
              <img
                src={listing.image_url || listing.images?.[0] || '/placeholder.svg'}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Title and Basic Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">{listing.dog_name}</span>
                <span>•</span>
                <span>{listing.breed}</span>
                <span>•</span>
                <span>{listing.age} months old</span>
                {listing.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-[#2C3EDC]">
                  ${listing.price?.toLocaleString()}
                </div>
                {listing.rehoming && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Rehoming
                  </Badge>
                )}
              </div>

              {/* Health Badges */}
              {healthBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {healthBadges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={`flex-1 ${isFavorited 
                  ? 'text-red-600 border-red-200 hover:bg-red-50' 
                  : 'text-gray-600 hover:text-red-600 hover:border-red-200'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                title="Share this listing"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button
                size="sm"
                onClick={handleContact}
                disabled={isCreatingConversation}
                className="flex-1 bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isCreatingConversation ? 'Starting...' : 'Contact'}
              </Button>
              
              <Button
                size="sm"
                onClick={handleContact}
                disabled={isCreatingConversation}
                className="flex-1 bg-[#2C3EDC] hover:bg-[#2C3EDC]/90 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Seller Card */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback>
                    {listing.profiles?.full_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSellerClick}
                      className="font-medium text-gray-900 hover:text-[#2C3EDC] hover:underline cursor-pointer transition-colors"
                    >
                      {listing.profiles?.full_name || 'Anonymous Seller'}
                    </button>
                    {listing.profiles?.verified && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {listing.profiles?.rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{listing.profiles.rating.toFixed(1)}</span>
                      <span>({listing.profiles.total_reviews || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <Collapsible open={!shouldCollapseAbout || aboutExpanded} onOpenChange={setAboutExpanded}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🐶 About {listing.dog_name}
                </h3>
                {shouldCollapseAbout && (
                  <div className="text-gray-400">
                    {aboutExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aboutContent}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <Collapsible open={reviewsExpanded} onOpenChange={setReviewsExpanded}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  ⭐️ Reviews & Ratings
                </h3>
                <div className="text-gray-400">
                  {reviewsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="text-gray-500 text-center py-8">
                No reviews yet for this listing
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
