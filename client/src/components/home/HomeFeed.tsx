
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';
import { apiRequest } from '@/lib/api';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: string;
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
  id: string;
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

// Mock data for testing purposes
const initialMockPosts: Post[] = [
  {
    id: '1',
    postUuid: '1',
    user: {
      id: '101',
      username: 'goldenbreeder',
      name: 'Austin Reyes',
      location: 'San Francisco, CA',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    image: 'https://placedog.com/500/280',
    likes: 25,
    isLiked: false,
    caption: 'Beautiful Golden Retriever puppies ready for their forever homes! 🐕 #goldenretriever #puppies',
    timeAgo: '2 hours ago',
    likedBy: [],
    comments: [
      {
        id: 'comment_1',
        user: {
          id: 'user_2',
          name: 'Sarah Wilson',
          username: 'sarahw',
          avatar: 'https://i.pravatar.cc/150?u=user_2',
        },
        text: 'So adorable! Are they still available? 😍',
        timestamp: '2h',
        likes: 3,
        isLiked: false,
      },
      {
        id: 'comment_2',
        user: {
          id: 'user_3',
          name: 'Mike Johnson',
          username: 'mikej',
          avatar: 'https://i.pravatar.cc/150?u=user_3',
        },
        text: 'What a beautiful litter! Do you have health certificates?',
        timestamp: '1h',
        likes: 1,
        isLiked: true,
      },
    ],
  },
  {
    id: '2',
    postUuid: '2',
    user: {
      id: '102',
      username: 'labsofca',
      name: 'Jennifer Martinez',
      location: 'Los Angeles, CA',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    image: 'https://placedog.com/500/281',
    likes: 42,
    isLiked: true,
    caption: 'Training session complete! These Labrador puppies are so smart 🧠 #labrador #training',
    timeAgo: '4 hours ago',
    likedBy: [],
    comments: [
      {
        id: 'comment_3',
        user: {
          id: 'user_4',
          name: 'David Chen',
          username: 'davidc',
          avatar: 'https://i.pravatar.cc/150?u=user_4',
        },
        text: 'Amazing progress! How old are they?',
        timestamp: '3h',
        likes: 2,
        isLiked: false,
      },
    ],
  },
];

const HomeFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);

  console.log('[HOME FEED] Rendering component', {
    userId: user?.id,
    hasUser: !!user,
    authLoading,
    postsCount: posts.length
  });

  // Mock posts fallback function
  const getMockPosts = () => initialMockPosts;

  useEffect(() => {
    if (!user) return;
    
    console.log('[HOME FEED] Starting data fetch for user:', user.id);
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    apiRequest('/posts/home-feed')
      .then((data) => {
        if (cancelled) return;
        console.log('[HOME FEED] Posts loaded from API:', data?.length || 0, 'posts');
        setPosts(data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[HOME FEED] Feed fetch error, using fallback:', err);
        setError('Failed to load feed, showing fallback content.');
        setPosts(getMockPosts());
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Convert database posts to display format
  const displayPosts = React.useMemo(() => {
    if (posts && Array.isArray(posts) && posts.length > 0) {
      // Check if posts are already in display format (mock data) or need conversion (API data)
      if (posts[0]?.postUuid) {
        console.log('[HOME FEED] Using formatted posts:', posts.length);
        return posts;
      }
      
      // Convert API posts to display format
      console.log('[HOME FEED] Converting API posts to display format:', posts.length);
      return posts.map(post => ({
        id: post.id,
        postUuid: post.id,
        user: {
          id: post.user_id,
          username: post.profiles?.username || 'User',
          name: post.profiles?.full_name || 'Unknown User',
          location: 'Location',
          avatar: post.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${post.user_id}`,
        },
        image: post.image_url || 'https://placedog.com/500/280',
        likes: 0,
        isLiked: false,
        caption: post.caption || '',
        timeAgo: new Date(post.created_at).toLocaleDateString(),
        likedBy: [],
        comments: [],
      }));
    }
    
    return posts || [];
  }, [posts]);

  useEffect(() => {
    // Add user's welcome post to mock data when using fallback
    if (user && error && posts === getMockPosts()) {
      console.log('[HOME FEED] Adding welcome post for user in fallback mode:', user.id);
      const userPost = {
        id: 'user_post_1',
        postUuid: 'user_post_1',
        user: {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'you',
          name: user.user_metadata?.full_name || 'Your Name',
          location: 'Your Location',
          avatar: user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
        },
        image: 'https://placedog.com/500/282',
        likes: 5,
        isLiked: false,
        caption: 'Welcome to MY PUP! This is your first post. 🐕',
        timeAgo: 'Just now',
        likedBy: [],
        comments: [],
      };
      
      setPosts(prev => {
        // Only add if not already present
        if (prev.some(p => p.id === 'user_post_1')) {
          return prev;
        }
        return [userPost, ...prev];
      });
    }
  }, [user, error, posts]);

  const handleLike = async (postId: string) => {
    // Handle post likes - update local state optimistically
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId || post.postUuid === postId ? { 
          ...post, 
          isLiked: !post.isLiked, 
          likes: post.isLiked ? post.likes - 1 : post.likes + 1 
        } : post
      )
    );
    
    // For API posts, also attempt to sync with backend
    if (!error) {
      try {
        console.log('[HOME FEED] Syncing like for post:', postId);
        // Add API call to sync like status
        // await apiRequest(`/posts/${postId}/like`, { method: 'POST' });
      } catch (err) {
        console.warn('[HOME FEED] Failed to sync like:', err);
      }
    }
  };

  const handleProfileClick = (userId: string) => {
    console.log(`Navigating to profile: ${userId}`);
    // Add navigation logic here if needed
  };

  const handleShare = (postId: string) => {
    console.log(`Sharing post: ${postId}`);
  };

  const handleBookmark = (postId: string) => {
    console.log(`Bookmarking post: ${postId}`);
  };

  const handleComment = (postId: string) => {
    console.log(`Commenting on post: ${postId}`);
  };

  const handleShowLikes = (postId: string) => {
    console.log(`Showing likes for post: ${postId}`);
  };

  const handleCommentsUpdate = (postId: string) => (updateFn: (comments: Comment[]) => Comment[]) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId || post.postUuid === postId ? { ...post, comments: updateFn(post.comments) } : post
      )
    );
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    console.log('[HOME FEED] Updating post:', postId, newCaption);
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.postUuid === postId 
          ? { ...post, caption: newCaption }
          : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    console.log('[HOME FEED] Deleting post:', postId);
    setPosts(prevPosts => 
      prevPosts.filter(post => post.postUuid !== postId)
    );
    setShowFullPostModal(false);
    setSelectedPost(null);
  };

  const handleImageClick = (post: Post) => {
    // Convert the post format for the modal
    const modalPost = {
      id: post.postUuid,
      user_id: post.user.id,
      caption: post.caption,
      image_url: post.image,
      video_url: null,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: post.user.name,
        username: post.user.username,
        avatar_url: post.user.avatar,
      },
    };
    setSelectedPost(modalPost);
    setShowFullPostModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading Home Feed...</span>
      </div>
    );
  }

  // Error state with fallback content
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800 text-sm font-medium">{error}</div>
        </div>
        <div className="space-y-6 py-4">
          {displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onProfileClick={handleProfileClick}
              onShare={handleShare}
              onBookmark={handleBookmark}
              onComment={handleComment}
              onShowLikes={handleShowLikes}
              onCommentsUpdate={handleCommentsUpdate(post.id)}
              onImageClick={() => handleImageClick(post)}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  // Normal state
  return (
    <div className="space-y-6 py-4">
      {displayPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No posts yet</div>
          <div className="text-gray-400">Be the first to share something!</div>
        </div>
      ) : (
        displayPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onProfileClick={handleProfileClick}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onComment={handleComment}
            onShowLikes={handleShowLikes}
            onCommentsUpdate={handleCommentsUpdate(post.id)}
            onImageClick={() => handleImageClick(post)}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
          />
        ))
      )}

      {showFullPostModal && selectedPost && (
        <FullPostModal
          post={selectedPost}
          isOpen={showFullPostModal}
          onClose={() => {
            setShowFullPostModal(false);
            setSelectedPost(null);
          }}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      )}
    </div>
  );
};

export default HomeFeed;
