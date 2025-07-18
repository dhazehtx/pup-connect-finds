
import React, { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { Heart, MessageCircle, Play } from 'lucide-react';
import SkeletonLoader from '@/components/ui/skeleton-loader';
import FullPostModal from '@/components/post/FullPostModal';
import { useNavigate } from 'react-router-dom';

interface ProfilePostsGridProps {
  userId: string;
}

const ProfilePostsGrid = ({ userId }: ProfilePostsGridProps) => {
  const { posts, loading } = usePosts(userId);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowFullPostModal(true);
  };

  const handleCloseModal = () => {
    setShowFullPostModal(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonLoader key={i} variant="image" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="relative aspect-square group cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.caption || 'Post'}
                className="w-full h-full object-cover"
              />
            ) : post.video_url ? (
              <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
                <video
                  src={post.video_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2">
                <p className="text-xs text-gray-600 line-clamp-3 text-center">
                  {post.caption}
                </p>
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-sm font-semibold">0</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FullPostModal
        post={selectedPost}
        isOpen={showFullPostModal}
        onClose={handleCloseModal}
        onProfileClick={handleProfileClick}
      />
    </>
  );
};

export default ProfilePostsGrid;
