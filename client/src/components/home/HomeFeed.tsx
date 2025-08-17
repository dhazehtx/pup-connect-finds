
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';
import { apiRequest } from '@/lib/api';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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

  console.log('[HOME FEED] Auth state:', user, authLoading);
  console.log('[HOME FEED] Rendering component', {
    userId: user?.id,
    hasUser: !!user,
    authLoading,
    postsCount: posts.length,
    loadingState: loading,
    errorState: !!error
  });

  // Mock posts fallback function
  const getMockPosts = () => initialMockPosts;

  useEffect(() => {
    // Enhanced auth guards - wait for auth to resolve and ensure user ID exists
    if (authLoading) {
      console.log('[HOME FEED] Auth still loading, skipping fetch');
      return;
    }
    
    if (!user?.id) {
      console.log('[HOME FEED] No user ID yet, skipping fetch. User:', user);
      console.log('no user yet, skipping fetch');
      setLoading(false);
      setError('Authentication required');
      setPosts(getMockPosts()); // Show fallback content for unauthenticated state
      return;
    }
    
    console.log('[HOME FEED] Fetching posts for user:', user?.id);
    
    console.log('[HOME FEED] Auth state:', {
      userId: user.id,
      email: user.email,
      authenticated: !!user
    });
    console.log('[HOME FEED] Fetching posts for user:', user.id);
    
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    
    // 5-second timeout for diagnostics
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[HOME FEED] API timeout after 5 seconds, showing fallback');
        setError('Request timeout, showing fallback content.');
        setPosts(getMockPosts());
        setLoading(false);
      }
    }, 5000);
    
    apiRequest('posts/home-feed', { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        clearTimeout(timeout);
        console.log('[HOME FEED] Posts fetch result: success, count:', data?.length || 0);
        setPosts(data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
          console.log('[HOME FEED] Request aborted');
          return;
        }
        console.warn('[HOME FEED] Posts fetch result: error -', err.message);
        setError('Failed to load feed, showing fallback content.');
        setPosts(getMockPosts());
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [user?.id, authLoading]); // Depend on user.id specifically, not the whole user object

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

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Authenticating...</span>
      </div>
    );
  }

  // Data loading state (after auth is resolved)
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading Home Feed...</span>
      </div>
    );
  }

  // Error state with fallback content and recovery options
  if (error && displayPosts.length === 0) {
    console.log('[HOME FEED] Showing error fallback UI for:', error);
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Feed Loading Issue</h3>
          <p className="text-blue-700 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => {
                console.log('[HOME FEED] User clicked retry button');
                window.location.reload();
              }} 
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Feed
            </Button>
            <Button 
              onClick={() => {
                console.log('[HOME FEED] User navigating to Explore as fallback');
                window.location.href = '/explore';
              }}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Switch to Explore
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state with partial content (shows error banner but displays fallback posts)
  if (error && displayPosts.length > 0) {
    console.log('[HOME FEED] Showing error banner with fallback posts');
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <div className="text-blue-800 text-sm font-medium">{error}</div>
          </div>
          <div className="mt-2 text-blue-700 text-xs">Showing fallback content below.</div>
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
