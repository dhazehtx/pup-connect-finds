
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share, Bookmark } from 'lucide-react';
import AnimatedHeart from '@/components/ui/animated-heart';
import { usePostLikes } from '@/hooks/usePostLikes';

interface Post {
  id: number;
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
  const { likesCount, isLiked, loading, toggleLike } = usePostLikes(post.id.toString());

  const handleLikeToggle = async () => {
    await toggleLike();
    // Call the original onLike for any additional logic
    onLike(post.id);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <AnimatedHeart
            isLiked={isLiked}
            onToggle={handleLikeToggle}
            size={24}
            disabled={loading}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto"
            onClick={() => onComment(post.id)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto"
            onClick={() => onShare(post.id)}
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
        className="font-semibold text-sm mb-1 cursor-pointer hover:text-gray-600"
        onClick={() => onShowLikes(post.id)}
      >
        {likesCount.toLocaleString()} likes
      </p>

      {/* Caption */}
      <p className="text-sm mb-2">
        <span 
          className="font-semibold cursor-pointer hover:underline"
          onClick={() => onProfileClick(post.user.id)}
        >
          {post.user.username}
        </span>{' '}
        {post.caption}
      </p>
    </>
  );
};

export default PostActions;
