
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import EditPostModal from './EditPostModal';

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

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onProfileClick: (userId: string) => void;
  onShare: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onComment: (postId: number) => void;
  onShowLikes: (postId: number) => void;
  onCommentsUpdate: (updateFn: (comments: Comment[]) => Comment[]) => void;
  onPostUpdate: (postId: string, newCaption: string) => void;
  onPostDelete: (postId: string) => void;
  onImageClick?: (post: Post) => void;
}

const PostCard = ({
  post,
  onLike,
  onProfileClick,
  onShare,
  onBookmark,
  onComment,
  onShowLikes,
  onCommentsUpdate,
  onPostUpdate,
  onPostDelete,
  onImageClick
}: PostCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(post);
    }
  };

  const handleEdit = (postToEdit: Post) => {
    console.log('PostCard: Edit button clicked for post:', postToEdit);
    setEditingPost(postToEdit);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    console.log('PostCard: Updating post:', postId, newCaption);
    onPostUpdate(postId, newCaption);
    handleCloseEditModal();
  };

  const handlePostDelete = (postId: string) => {
    console.log('PostCard: Deleting post:', postId);
    onPostDelete(postId);
  };

  return (
    <>
      <Card className="rounded-lg md:rounded-xl border shadow-sm md:shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="p-3 md:p-4">
            <PostHeader 
              user={post.user}
              post={post}
              onProfileClick={onProfileClick}
              onEdit={handleEdit}
              onDelete={handlePostDelete}
            />
          </div>

          {/* Post Image - Make it clickable */}
          <div className="aspect-square cursor-pointer" onClick={handleImageClick}>
            <img
              src={post.image}
              alt="Dog post"
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Post Actions and Content - Improved spacing for mobile */}
          <div className="p-3 md:p-4 space-y-3">
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
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>
        </CardContent>
      </Card>

      <EditPostModal
        post={editingPost}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handlePostUpdate}
      />
    </>
  );
};

export default PostCard;
