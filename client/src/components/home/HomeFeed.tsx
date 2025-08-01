
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  const [mockPosts, setMockPosts] = useState(initialMockPosts);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);

  // 1. ONE-TIME FETCH GUARD - Prevent fetch loops with ref guard
  const hasFetchedPostsRef = useRef(false);

  console.log('[HOME FEED] Rendering component', {
    userId: user?.id,
    hasUser: !!user,
    authLoading,
    hasFetchedPosts: hasFetchedPostsRef.current
  });

  useEffect(() => {
    console.log('[HOME FEED] Component mounted');
    return () => {
      console.log('[HOME FEED] Component unmounted');
      // Reset fetch guard on unmount
      hasFetchedPostsRef.current = false;
    };
  }, []);

  // 2. DELAY FETCH UNTIL AUTH IS SETTLED - Wait for auth loading to complete
  const shouldFetchPosts = !authLoading && user && !hasFetchedPostsRef.current;

  // Fetch posts with proper guards
  const { data: dbPosts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['home-feed-posts'],
    queryFn: async () => {
      console.log('[HOME FEED] Starting posts fetch...');
      hasFetchedPostsRef.current = true;
      
      try {
        // Try to fetch from API - using proper API request format
        const response = await apiRequest('/api/posts/home-feed', {
          method: 'GET',
        });
        console.log('[HOME FEED] Posts data loaded from API:', response?.length || 0, 'posts');
        return response || [];
      } catch (error) {
        console.error('[HOME FEED] Posts fetch error:', error);
        // Return empty array - use mock posts as fallback in component logic
        console.log('[HOME FEED] Using mock posts as fallback');
        return [];
      }
    },
    enabled: shouldFetchPosts,
  });

  // 3. LOG CLEARLY WHEN DATA ARRIVES OR ERRORS
  useEffect(() => {
    if (dbPosts && Array.isArray(dbPosts)) {
      console.log('[HOME FEED] Posts data loaded successfully:', dbPosts.length, 'items');
    }
    if (postsError) {
      console.error('[HOME FEED] Posts loading failed:', postsError);
    }
  }, [dbPosts, postsError]);

  const loading = authLoading || postsLoading;

  // Convert database posts to display format or use mock data
  const displayPosts = React.useMemo(() => {
    // Use database posts if available and not empty
    if (dbPosts && Array.isArray(dbPosts) && dbPosts.length > 0) {
      console.log('[HOME FEED] Using database posts:', dbPosts.length);
      return dbPosts.map(post => ({
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
    
    // Fallback to mock data
    console.log('[HOME FEED] Using mock posts:', mockPosts.length);
    return mockPosts;
  }, [dbPosts, mockPosts]);

  useEffect(() => {
    // Add user's own posts to mock data only if no database posts and user is authenticated
    if (user && (!dbPosts || dbPosts.length === 0) && !authLoading && hasFetchedPostsRef.current) {
      console.log('[HOME FEED] Adding welcome post for user:', user.id);
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
      
      setMockPosts(prev => {
        // Only add if not already present
        if (prev.some(p => p.id === 'user_post_1')) {
          return prev;
        }
        return [userPost, ...prev];
      });
    }
  }, [user, dbPosts, authLoading]);

  const handleLike = async (postId: string) => {
    // Handle both database posts and mock posts
    if (dbPosts && dbPosts.length > 0) {
      // For database posts, use the actual like API
      try {
        // Find the specific post and toggle its like status
        const postToUpdate = displayPosts.find(p => p.id === postId);
        if (!postToUpdate) return;
        
        // Use the proper post likes hook logic here
        // This is a simplified version - in real implementation you'd use usePostLikes hook
        console.log('Liking database post:', postId);
      } catch (error) {
        console.error('Error liking database post:', error);
      }
    } else {
      // Handle mock posts - this logic is already correct
      setMockPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          } : post
        )
      );
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
    setMockPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: updateFn(post.comments) } : post
      )
    );
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    console.log('Updating post in feed:', postId, newCaption);
    setMockPosts(prevPosts => 
      prevPosts.map(post => 
        post.postUuid === postId 
          ? { ...post, caption: newCaption }
          : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    console.log('Deleting post from feed:', postId);
    setMockPosts(prevPosts => 
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading posts...</span>
      </div>
    );
  }

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
