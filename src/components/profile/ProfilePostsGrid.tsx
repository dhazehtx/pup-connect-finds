
import React, { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';
import LoadingState from '@/components/ui/loading-state';

interface ProfilePostsGridProps {
  userId: string;
}

const ProfilePostsGrid = ({ userId }: ProfilePostsGridProps) => {
  const { posts, loading } = usePosts(userId);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    console.log('Post updated:', postId, newCaption);
    // This would typically update the post in the local state
  };

  const handlePostDelete = (postId: string) => {
    console.log('Post deleted:', postId);
    // This would typically remove the post from the local state
    handleCloseModal();
  };

  const handleProfileClick = (userId: string) => {
    console.log('Profile clicked:', userId);
  };

  if (loading) {
    return <LoadingState message="Loading posts..." />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square cursor-pointer overflow-hidden rounded-sm hover:opacity-75 transition-opacity"
            onClick={() => handlePostClick(post)}
          >
            <img
              src={post.image_url || 'https://placedog.com/300/300'}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <FullPostModal
        post={selectedPost}
        isOpen={showModal}
        onClose={handleCloseModal}
        onProfileClick={handleProfileClick}
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
      />
    </>
  );
};

export default ProfilePostsGrid;
