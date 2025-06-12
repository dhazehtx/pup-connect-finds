import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PostCard from '@/components/home/PostCard';
import GuestHero from '@/components/home/GuestHero';
import LikesModal from '@/components/post/LikesModal';
import StoriesReel from '@/components/stories/StoriesReel';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: number;
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
  id: number;
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

const Home = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState<User[]>([]);

  // Sample posts data with better demo images
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: {
        id: '1',
        username: 'goldenpaws_official',
        name: 'Golden Paws',
        location: 'San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face'
      },
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop',
      likes: 1234,
      isLiked: false,
      caption: 'Beautiful day at the park with my golden retriever! 🐕✨ Nothing beats those sunny afternoon walks.',
      timeAgo: '2 hours ago',
      likedBy: [
        {
          id: 'user1',
          name: 'Sarah Johnson',
          username: 'sarah_j',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face',
          verified: true,
          isFollowing: false
        },
        {
          id: 'user2', 
          name: 'Mike Davis',
          username: 'mike_d',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          verified: false,
          isFollowing: true
        },
        {
          id: 'user3',
          name: 'Emma Wilson',
          username: 'emma_w',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          verified: true,
          isFollowing: false
        }
      ],
      comments: [
        {
          id: 1,
          user: {
            id: '2',
            name: 'Dog Lover',
            username: 'doglover123',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face'
          },
          text: 'Such a beautiful pup! 🥰',
          timestamp: '1h ago',
          likes: 12,
          isLiked: false,
          likedBy: [
            {
              id: 'user4',
              name: 'Alex Brown',
              username: 'alex_b',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              verified: false,
              isFollowing: false
            }
          ]
        },
        {
          id: 2,
          user: {
            id: '3',
            name: 'Puppy Fan',
            username: 'puppyfan',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          text: 'Where is this park? Looks amazing!',
          timestamp: '45m ago',
          likes: 5,
          isLiked: false,
          likedBy: [
            {
              id: 'user5',
              name: 'Lisa Chen',
              username: 'lisa_c',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              verified: true,
              isFollowing: true
            }
          ]
        }
      ]
    },
    {
      id: 2,
      user: {
        id: '4',
        username: 'puppylove',
        name: 'Happy Puppies',
        location: 'Los Angeles, CA',
        avatar: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=150&h=150&fit=crop&crop=face'
      },
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop',
      likes: 856,
      isLiked: false,
      caption: 'Training session complete! Good boy! 🎾 Teaching sit, stay, and fetch today.',
      timeAgo: '4 hours ago',
      likedBy: [],
      comments: [
        {
          id: 3,
          user: {
            id: '5',
            name: 'Trainer Pro',
            username: 'trainerpro',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          text: 'Great training technique! What method do you use?',
          timestamp: '3h ago',
          likes: 8,
          isLiked: false,
          likedBy: []
        }
      ]
    },
    {
      id: 3,
      user: {
        id: '6',
        username: 'dogloversclub',
        name: 'Dog Lovers Club',
        location: 'New York, NY',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop',
      likes: 642,
      isLiked: false,
      caption: 'Playtime with friends! 🐾 Best day ever at the dog park.',
      timeAgo: '6 hours ago',
      likedBy: [],
      comments: []
    },
    {
      id: 4,
      user: {
        id: '7',
        username: 'labradorlove',
        name: 'Labrador Love',
        location: 'Chicago, IL',
        avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=150&h=150&fit=crop&crop=face'
      },
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
      likes: 923,
      isLiked: false,
      caption: 'Morning walk vibes! 🌅 Starting the day right with my best buddy.',
      timeAgo: '8 hours ago',
      likedBy: [],
      comments: []
    },
    {
      id: 5,
      user: {
        id: '8',
        username: 'puppyparadise',
        name: 'Puppy Paradise',
        location: 'Miami, FL',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      },
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop',
      likes: 567,
      isLiked: false,
      caption: 'Sleepy Sunday afternoon 😴 This little one had a big day!',
      timeAgo: '12 hours ago',
      likedBy: [],
      comments: []
    }
  ]);

  // Show guest homepage for non-authenticated users
  if (!user && !isGuest) {
    return <GuestHero />;
  }

  const handleLike = (postId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleProfileClick = (userId: string) => {
    if (!user && !isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to view profiles",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/profile/${userId}`);
  };

  const handleShare = (postId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to share posts",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Shared!",
      description: "Post shared successfully",
    });
  };

  const handleBookmark = (postId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bookmarked!",
      description: "Post saved to your bookmarks",
    });
  };

  const handleComment = (postId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    // Comment functionality would be implemented here
  };

  const handleShowLikes = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post && post.likedBy) {
      setSelectedPostLikes(post.likedBy);
      setShowLikesModal(true);
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Main social media feed layout with stories
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Stories Section */}
      <StoriesReel />
      
      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onProfileClick={handleProfileClick}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onComment={handleComment}
            onShowLikes={handleShowLikes}
            onCommentsUpdate={(updateFn) => {
              setPosts(prev => prev.map(p => 
                p.id === post.id 
                  ? { ...p, comments: typeof updateFn === 'function' ? updateFn(p.comments) : updateFn }
                  : p
              ));
            }}
          />
        ))}
      </div>

      {/* Likes Modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={selectedPostLikes}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
};

export default Home;
