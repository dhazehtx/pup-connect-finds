
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import CommentsSection from '@/components/post/CommentsSection';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: number;
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
  likedBy: User[];
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onProfileClick: (userId: string) => void;
  onShare: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onComment: (postId: number) => void;
  onShowLikes: (postId: number) => void;
  onCommentsUpdate: (updateFn: (comments: Comment[]) => Comment[]) => void;
}

const PostCard = ({
  post,
  onLike,
  onProfileClick,
  onShare,
  onBookmark,
  onComment,
  onShowLikes,
  onCommentsUpdate
}: PostCardProps) => {
  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none">
      <CardContent className="p-0">
        {/* Post Header */}
        <PostHeader 
          user={post.user}
          onProfileClick={onProfileClick}
        />

        {/* Post Image */}
        <div className="aspect-square">
          <img
            src={post.image}
            alt="Dog post"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Post Actions and Content */}
        <div className="p-3">
          <PostActions
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onBookmark={onBookmark}
            onShowLikes={onShowLikes}
            onProfileClick={onProfileClick}
          />

          {/* Comments Section */}
          {post.comments.length > 0 && (
            <CommentsSection
              comments={post.comments}
              setComments={onCommentsUpdate}
              onProfileClick={onProfileClick}
            />
          )}

          {/* Time */}
          <p className="text-xs text-gray-500 mt-2">{post.timeAgo}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
