
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from './PostCard';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';

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
      username: 'mockUser1',
      name: 'Mock User One',
      location: 'Mockville',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    image: 'https://placedog.com/500/280',
    likes: 25,
    isLiked: false,
    caption: 'Enjoying a sunny day at the park! ☀️ #doglife #parkday',
    timeAgo: '2 hours ago',
    likedBy: [],
    comments: [],
  },
  {
    id: '2',
    postUuid: '2',
    user: {
      id: '102',
      username: 'mockUser2',
      name: 'Mock User Two',
      location: 'Anytown',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    image: 'https://placedog.com/500/281',
    likes: 42,
    isLiked: true,
    caption: 'Chasing squirrels is my cardio. 🐿️ #dogadventures #squirrelchase',
    timeAgo: '4 hours ago',
    likedBy: [],
    comments: [],
  },
];

const HomeFeed = () => {
  const { user } = useAuth();
  const { posts: dbPosts, loading } = usePosts();
  const [mockPosts, setMockPosts] = useState(initialMockPosts);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);

  useEffect(() => {
    // You can fetch real posts from an API here
    // For now, we're using mock data
  }, []);

  const handleLike = (postId: string) => {
    setMockPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
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
      }
    };
    
    setSelectedPost(modalPost);
    setShowFullPostModal(true);
  };

  const mapDbPostToMockPost = (dbPost: any): Post => ({
    id: dbPost.id,
    postUuid: dbPost.id,
    user: {
      id: dbPost.user_id,
      username: dbPost.profiles?.username || 'Unknown User',
      name: dbPost.profiles?.full_name || 'Unknown',
      location: 'Unknown',
      avatar: dbPost.profiles?.avatar_url || '',
    },
    image: dbPost.image_url || 'https://placedog.com/500/280',
    likes: 0,
    isLiked: false,
    caption: dbPost.caption || 'No caption',
    timeAgo: 'Just now',
    likedBy: [],
    comments: [],
  });

  const currentPosts = dbPosts.length > 0 ? dbPosts.map(mapDbPostToMockPost) : mockPosts;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-6 sm:space-y-8">
          {currentPosts.map((post) => (
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
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      </div>

      <FullPostModal
        post={selectedPost}
        isOpen={showFullPostModal}
        onClose={() => {
          setShowFullPostModal(false);
          setSelectedPost(null);
        }}
        onProfileClick={handleProfileClick}
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
      />
    </>
  );
};

export default HomeFeed;
