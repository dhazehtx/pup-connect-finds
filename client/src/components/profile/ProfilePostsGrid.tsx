
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';
import LoadingState from '@/components/ui/loading-state';

interface ProfilePostsGridProps {
  userId: string;
}

const ProfilePostsGrid = ({ userId }: ProfilePostsGridProps) => {
  const { posts, loading, fetchPosts } = usePosts(userId);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    fetchPosts();
  };

  const handlePostDelete = (postId: string) => {
    fetchPosts();
    handleCloseModal();
  };

  const handleProfileClick = (clickedUserId: string) => {
    navigate(`/profile/${clickedUserId}`);
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

      {showModal && selectedPost && (
        <FullPostModal
          post={selectedPost}
          isOpen={showModal}
          onClose={handleCloseModal}
          onProfileClick={handleProfileClick}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      )}
    </>
  );
};

export default ProfilePostsGrid;
