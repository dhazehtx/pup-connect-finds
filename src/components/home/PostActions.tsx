
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Bookmark } from 'lucide-react';
import AnimatedHeart from '@/components/ui/animated-heart';
import { usePostLikes } from '@/hooks/usePostLikes';
import CommentButton from '@/components/post/CommentButton';
import CommentsModal from '@/components/post/CommentsModal';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: number;
  postUuid: string; // Add the UUID for database operations
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
}

interface PostActionsProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onShowLikes: (postId: number) => void;
  onProfileClick: (userId: string) => void;
}

const PostActions = ({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onShowLikes,
  onProfileClick
}: PostActionsProps) => {
  // Use the actual UUID from the post
  const { likesCount, isLiked, loading, toggleLike } = usePostLikes(post.postUuid);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const { toast } = useToast();

  const handleLikeToggle = async () => {
    await toggleLike();
    onLike(post.id);
  };

  const handleCommentClick = () => {
    setShowCommentsModal(true);
    onComment(post.id);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.postUuid}`;
    
    // Try native share API first (mobile devices)
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.caption,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // If user cancels share, don't show error
        if (error.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }

    onShare(post.id);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AnimatedHeart
              isLiked={isLiked}
              onToggle={handleLikeToggle}
              size={24}
              disabled={loading}
            />
            <CommentButton 
              postId={post.postUuid}
              onCommentClick={handleCommentClick}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto"
              onClick={handleShare}
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto"
            onClick={() => onBookmark(post.id)}
          >
            <Bookmark className="w-6 h-6" />
          </Button>
        </div>

        {/* Likes */}
        <p 
          className="font-semibold text-sm cursor-pointer hover:text-gray-600"
          onClick={() => onShowLikes(post.id)}
        >
          {likesCount.toLocaleString()} likes
        </p>

        {/* Caption */}
        <div className="text-sm">
          <span 
            className="font-semibold cursor-pointer hover:underline"
            onClick={() => onProfileClick(post.user.id)}
          >
            {post.user.username}
          </span>{' '}
          <span className="break-words">{post.caption}</span>
        </div>
      </div>

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={post.postUuid}
        onProfileClick={onProfileClick}
      />
    </>
  );
};

export default PostActions;
