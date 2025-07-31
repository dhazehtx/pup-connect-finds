import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'wouter';
import HashtagParser from '@/components/tags/HashtagParser';
import CommentsSection from '@/components/comments/CommentsSection';
import SavePostButton from '@/components/posts/SavePostButton';
import ImageCarousel from '@/components/feed/ImageCarousel';

interface PostDetailModalProps {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  open,
  onOpenChange,
  onLike,
  onShare
}) => {
  const [location, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
  }, [post.is_liked]);

  const handleLike = () => {
    setIsLiked(prev => !prev);
    onLike?.(post.id);
  };

  const handleHashtagClick = (hashtag: string) => {
    setLocation(`/explore?hashtag=${encodeURIComponent(hashtag)}`);
    onOpenChange(false);
  };

  const getMediaContent = () => {
    // Image content
    if (post.images && post.images.length > 0) {
      return (
        <ImageCarousel
          images={post.images}
          alt={post.title || 'Post image'}
          aspectRatio="landscape"
          showIndicators={true}
          showNavigation={true}
        />
      );
    }

    // Video content
    if (post.video_url) {
      return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          >
            <source src={post.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Media Side */}
          <div className="bg-black flex items-center justify-center">
            {getMediaContent() || (
              <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <MessageCircle className="w-24 h-24 text-gray-600" />
              </div>
            )}
          </div>

          {/* Content Side */}
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b">
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
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4 border-b">
              {post.title && (
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              )}

              <div className="mb-3">
                <HashtagParser
                  text={post.caption || post.content}
                  className="text-sm leading-relaxed"
                  onHashtagClick={handleHashtagClick}
                />
              </div>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((hashtag: string, index: number) => (
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
              <div className="flex items-center justify-between">
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
                    className="p-0 h-auto text-muted-foreground"
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    {commentsCount}
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
                <span className="text-xs text-muted-foreground mt-2 block">
                  {post.views_count} views
                </span>
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              <CommentsSection
                postId={post.id}
                commentsCount={commentsCount}
                onCommentsCountChange={setCommentsCount}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;