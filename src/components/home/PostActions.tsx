
import React from 'react';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  likedBy?: User[];
}

interface Post {
  id: string;
  postUuid: string;
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
  likedBy: User[];
  comments: Comment[];
}

interface PostActionsProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShowLikes: (postId: string) => void;
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
  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const handleShare = () => {
    onShare(post.id);
  };

  const handleBookmark = () => {
    onBookmark(post.id);
  };

  const handleShowLikes = () => {
    onShowLikes(post.id);
  };

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`p-0 h-auto ${post.isLiked ? 'text-red-500' : 'text-gray-700'}`}
          >
            <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="p-0 h-auto text-gray-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-0 h-auto text-gray-700"
          >
            <Share className="h-6 w-6" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="p-0 h-auto text-gray-700"
        >
          <Bookmark className="h-6 w-6" />
        </Button>
      </div>

      {/* Likes count */}
      <div className="space-y-2">
        {post.likes > 0 && (
          <p className="font-semibold text-sm cursor-pointer" onClick={handleShowLikes}>
            {post.likes} {post.likes === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm">
            <span 
              className="font-semibold cursor-pointer hover:underline mr-2"
              onClick={() => onProfileClick(post.user.id)}
            >
              {post.user.username}
            </span>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comments count */}
        {post.comments.length > 0 && (
          <p className="text-sm text-gray-500 cursor-pointer" onClick={handleComment}>
            View all {post.comments.length} comments
          </p>
        )}
      </div>
    </div>
  );
};

export default PostActions;
