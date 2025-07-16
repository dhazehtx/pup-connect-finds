
import React from 'react';
import { usePosts } from '@/hooks/usePosts';
import { Heart, MessageCircle, Play } from 'lucide-react';
import { formatPostTime } from '@/utils/timeFormatting';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorState from '@/components/ui/error-state';

interface ProfilePostsGridProps {
  userId: string;
}

const ProfilePostsGrid = ({ userId }: ProfilePostsGridProps) => {
  const { posts, loading, error, fetchPosts } = usePosts(userId); // Filter posts by user ID

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load posts"
        message="Please try again."
        onRetry={fetchPosts}
        retryText="Retry loading"
        variant="minimal"
      />
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
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div key={post.id} className="relative aspect-square group cursor-pointer">
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
          
          {/* Time indicator */}
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
            {formatPostTime(post.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePostsGrid;
