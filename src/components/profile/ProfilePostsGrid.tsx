
import React from 'react';
import { usePosts } from '@/hooks/usePosts';
import { Heart, MessageCircle, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from '@/components/ui/skeleton-loader';

interface ProfilePostsGridProps {
  userId: string;
}

const ProfilePostsGrid = ({ userId }: ProfilePostsGridProps) => {
  const { posts, loading } = usePosts(userId);

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
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-500">
          When you share posts, they'll appear here.
        </p>
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
              className="w-full h-full object-cover rounded-lg"
            />
          ) : post.video_url ? (
            <div className="relative w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <Play className="w-8 h-8 text-white absolute z-10" />
              <video
                src={post.video_url}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                muted
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2 rounded-lg">
              <p className="text-xs text-gray-600 line-clamp-3 text-center">
                {post.caption}
              </p>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
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

          {/* Post info on hover */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs truncate">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePostsGrid;
