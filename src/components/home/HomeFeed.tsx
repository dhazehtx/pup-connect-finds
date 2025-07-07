
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
        <LoadingSkeleton viewMode="list" />
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
          posts.map((post) => {
            // Convert database post to UI post format
            const uiPost = {
              id: parseInt(post.id.slice(-8), 16), // Convert UUID to number for UI compatibility
              user: {
                id: post.user_id,
                username: post.profiles?.username || 'Unknown',
                name: post.profiles?.full_name || 'Unknown User',
                location: 'Location', // Default location
                avatar: post.profiles?.avatar_url || '/placeholder.svg'
              },
              image: post.image_url || '/placeholder.svg',
              likes: 0, // Default likes count
              isLiked: false, // Default liked state
              caption: post.caption || '',
              timeAgo: new Date(post.created_at).toLocaleDateString(),
              likedBy: [], // Default empty array
              comments: [] // Default empty array
            };
            
            return (
              <PostCard 
                key={post.id} 
                post={uiPost}
                onLike={() => {}}
                onProfileClick={() => {}}
                onShare={() => {}}
                onBookmark={() => {}}
                onComment={() => {}}
                onShowLikes={() => {}}
                onCommentsUpdate={() => {}}
              />
            );
          })
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
