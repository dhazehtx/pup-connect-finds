
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import SocialPostCreator from '@/components/posts/SocialPostCreator';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const HomeFeed = () => {
  const { user } = useAuth();
  const { posts, loading, fetchPosts } = usePosts();

  const handlePostCreated = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Social Post Creator */}
      {user && (
        <SocialPostCreator 
          onPostCreated={handlePostCreated}
          className="bg-white shadow-sm"
        />
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet.</p>
            <p className="text-gray-400 mt-2">Start sharing your updates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
