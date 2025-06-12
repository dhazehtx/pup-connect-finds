import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AnimatedHeart from '@/components/ui/animated-heart';
import CommentsSection from '@/components/post/CommentsSection';
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

  // Sample posts data with interactive functionality
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: {
        id: '1',
        username: 'goldenpaws_official',
        name: 'Golden Paws',
        location: 'San Francisco, CA',
        avatar: '/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png'
      },
      image: '/lovable-uploads/e5a0f017-3263-4e2a-b8eb-c15611287ed7.png',
      likes: 1234,
      isLiked: false,
      caption: 'Beautiful day at the park! 🐕',
      timeAgo: '2 hours ago',
      likedBy: [
        {
          id: 'user1',
          name: 'Sarah Johnson',
          username: 'sarah_j',
          avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png',
          verified: true,
          isFollowing: false
        },
        {
          id: 'user2', 
          name: 'Mike Davis',
          username: 'mike_d',
          avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png',
          verified: false,
          isFollowing: true
        },
        {
          id: 'user3',
          name: 'Emma Wilson',
          username: 'emma_w',
          avatar: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
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
            avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png'
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
              avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png',
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
            avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png'
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
              avatar: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
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
        username: 'happypuppies',
        name: 'Happy Puppies',
        location: 'Los Angeles, CA',
        avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png'
      },
      image: '/lovable-uploads/3ae80125-17a2-47bf-85a7-2e69d508dee0.png',
      likes: 856,
      isLiked: false,
      caption: 'Training session complete! Good boy! 🎾',
      timeAgo: '4 hours ago',
      likedBy: [],
      comments: [
        {
          id: 3,
          user: {
            id: '5',
            name: 'Trainer Pro',
            username: 'trainerpro',
            avatar: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png'
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
        avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png'
      },
      image: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
      likes: 642,
      isLiked: false,
      caption: 'Playtime with friends! 🐾',
      timeAgo: '6 hours ago',
      likedBy: [],
      comments: []
    }
  ]);

  // Show guest homepage for non-authenticated users
  if (!user && !isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero Section for Guests */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to MY PUP! 🐕
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find your perfect companion from trusted breeders and connect with fellow dog lovers
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" asChild>
              <Link to="/explore">
                Browse Dogs
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
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

  // Main social media feed layout with stories
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Stories Section */}
      <StoriesReel />
      
      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => (
          <Card key={post.id} className="rounded-none border-x-0 border-t-0 shadow-none">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => handleProfileClick(post.user.id)}
                >
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm hover:underline">{post.user.username}</p>
                    <p className="text-xs text-gray-500">{post.user.location}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Image */}
              <div className="aspect-square">
                <img
                  src={post.image}
                  alt="Dog post"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <AnimatedHeart
                      isLiked={post.isLiked}
                      onToggle={() => handleLike(post.id)}
                      size={24}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleComment(post.id)}
                    >
                      <MessageCircle className="w-6 h-6" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleShare(post.id)}
                    >
                      <Share className="w-6 h-6" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => handleBookmark(post.id)}
                  >
                    <Bookmark className="w-6 h-6" />
                  </Button>
                </div>

                {/* Likes */}
                <p 
                  className="font-semibold text-sm mb-1 cursor-pointer hover:text-gray-600"
                  onClick={() => handleShowLikes(post.id)}
                >
                  {post.likes.toLocaleString()} likes
                </p>

                {/* Caption */}
                <p className="text-sm mb-2">
                  <span 
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() => handleProfileClick(post.user.id)}
                  >
                    {post.user.username}
                  </span>{' '}
                  {post.caption}
                </p>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <CommentsSection
                    comments={post.comments}
                    setComments={(updateFn) => {
                      setPosts(prev => prev.map(p => 
                        p.id === post.id 
                          ? { ...p, comments: typeof updateFn === 'function' ? updateFn(p.comments) : updateFn }
                          : p
                      ));
                    }}
                    onProfileClick={handleProfileClick}
                  />
                )}

                {/* Time */}
                <p className="text-xs text-gray-500 mt-2">{post.timeAgo}</p>
              </div>
            </CardContent>
          </Card>
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
