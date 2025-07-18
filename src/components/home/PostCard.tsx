
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import FullPostModal from '@/components/post/FullPostModal';

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
  const [showFullPostModal, setShowFullPostModal] = useState(false);

  // Convert the post format for the modal
  const modalPost = {
    id: post.postUuid, // Use the actual UUID
    user_id: post.user.id,
    caption: post.caption,
    image_url: post.image,
    video_url: null,
    created_at: new Date().toISOString(), // You might want to add this to your Post interface
    profiles: {
      full_name: post.user.name,
      username: post.user.username,
      avatar_url: post.user.avatar,
    }
  };

  const handleImageClick = () => {
    setShowFullPostModal(true);
  };

  const handleCloseModal = () => {
    setShowFullPostModal(false);
  };

  return (
    <>
      <Card className="rounded-none border-x-0 border-t-0 shadow-none">
        <CardContent className="p-0">
          {/* Post Header */}
          <PostHeader 
            user={post.user}
            onProfileClick={onProfileClick}
          />

          {/* Post Image - Make it clickable */}
          <div className="aspect-square cursor-pointer" onClick={handleImageClick}>
            <img
              src={post.image}
              alt="Dog post"
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
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

            {/* Time */}
            <p className="text-xs text-gray-500 mt-2">{post.timeAgo}</p>
          </div>
        </CardContent>
      </Card>

      <FullPostModal
        post={modalPost}
        isOpen={showFullPostModal}
        onClose={handleCloseModal}
        onProfileClick={onProfileClick}
      />
    </>
  );
};

export default PostCard;
