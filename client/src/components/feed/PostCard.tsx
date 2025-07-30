import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ImageCarousel from './ImageCarousel';
import PostDetailModal from '@/components/posts/PostDetailModal';
import HashtagParser from '@/components/tags/HashtagParser';
import SavePostButton from '@/components/posts/SavePostButton';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    title?: string;
    content: string;
    image_url?: string;
    images?: string[];
    video_url?: string;
    videos?: string[];
    post_type: string;
    caption?: string;
    hashtags?: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views_count?: number;
    created_at: string;
    profiles?: {
      full_name: string;
      username: string;
      avatar_url?: string;
      verified?: boolean;
    };
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onOpenReels?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onOpenReels
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { user } = useAuth();

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleHashtagClick = (hashtag: string) => {
    // Will navigate to filtered feed page
    console.log('Hashtag clicked:', hashtag);
  };

  // Get media to display
  const getMediaContent = () => {
    // Multiple images
    if (post.images && post.images.length > 0) {
      return (
        <ImageCarousel 
          images={post.images}
          alt={post.title || 'Post image'}
          aspectRatio="square"
          showIndicators={true}
          showNavigation={true}
        />
      );
    }
    
    // Legacy single image
    if (post.image_url) {
      return (
        <ImageCarousel 
          images={[post.image_url]}
          alt={post.title || 'Post image'}
          aspectRatio="square"
          showIndicators={false}
          showNavigation={false}
        />
      );
    }

    // Single video (not reel)
    if (post.video_url && post.post_type !== 'reel') {
      return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-cover"
            controls
            muted={isMuted}
            preload="metadata"
          >
            <source src={post.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      );
    }

    // Reel preview
    if (post.video_url && post.post_type === 'reel') {
      return (
        <div 
          className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => onOpenReels?.(post.id)}
        >
          <video
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          >
            <source src={post.video_url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="absolute top-2 left-2 bg-black/70 text-white">
            Reel
          </Badge>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {post.profiles?.full_name || 'Anonymous'}
                </span>
                <span className="text-muted-foreground text-sm">
                  @{post.profiles?.username || 'user'}
                </span>
                {post.profiles?.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Title */}
        {post.title && (
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        )}

        {/* Content/Caption */}
        <div className="mb-4">
          <HashtagParser
            text={post.caption || post.content}
            className="text-sm leading-relaxed"
            onHashtagClick={handleHashtagClick}
          />
        </div>

        {/* Media Content */}
        {getMediaContent()}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.hashtags.map((hashtag, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary/20"
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes_count}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailModal(true)}
              className="p-0 h-auto text-muted-foreground"
            >
              <MessageCircle className="w-5 h-5 mr-1" />
              {post.comments_count}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(post.id)}
              className="p-0 h-auto text-muted-foreground"
            >
              <Share className="w-5 h-5 mr-1" />
              {post.shares_count}
            </Button>
          </div>

          {/* Save Post Button */}
          <SavePostButton postId={post.id} size="sm" />
        </div>

          {/* Views for video content */}
          {post.views_count !== undefined && (
            <span className="text-xs text-muted-foreground">
              {post.views_count} views
            </span>
          )}
        </div>
      </CardContent>

      {/* Post Detail Modal with Comments */}
      <PostDetailModal
        post={post}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onLike={onLike}
        onShare={onShare}
      />
    </Card>
  );
};

export default PostCard;