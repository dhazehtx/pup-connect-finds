import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share, Bookmark, Plus, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ModernPostCreator from './ModernPostCreator';

const mockPosts = [
  {
    id: 1,
    user: {
      id: 'user1',
      username: 'john_doe',
      name: 'John Doe',
      location: 'New York',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    },
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600',
    likes: 120,
    isLiked: true,
    caption: 'Enjoying a sunny day with my best friend!',
    timeAgo: '2 hours ago',
    likedBy: [
      { id: 'user2', username: 'jane_smith' },
      { id: 'user3', username: 'alex_jones' }
    ],
    comments: [
      { id: 'comment1', user: 'jane_smith', text: 'Such a cute dog!' },
      { id: 'comment2', user: 'alex_jones', text: 'Where was this taken?' }
    ]
  },
  {
    id: 2,
    user: {
      id: 'user4',
      username: 'emily_parker',
      name: 'Emily Parker',
      location: 'Los Angeles',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d674c79?w=150&h=150&fit=crop&crop=face'
    },
    image: 'https://images.unsplash.com/photo-1548247416-ec661342273c?w=600',
    likes: 85,
    isLiked: false,
    caption: 'Morning cuddles are the best!',
    timeAgo: '1 day ago',
    likedBy: [
      { id: 'user5', username: 'sam_wilson' },
      { id: 'user6', username: 'linda_brown' }
    ],
    comments: [
      { id: 'comment3', user: 'sam_wilson', text: 'Aww, so adorable!' },
      { id: 'comment4', user: 'linda_brown', text: 'I want one!' }
    ]
  },
];

const HomeFeed = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState(mockPosts);
  const [showPostCreator, setShowPostCreator] = useState(false);

  useEffect(() => {
    document.title = 'My Pup - Home';
  }, []);

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
  };

  const handleShare = (postId: number) => {
    toast({
      title: "Post Shared",
      description: `You have shared post ${postId} with your followers`,
    });
  };

  const handleBookmark = (postId: number) => {
    toast({
      title: "Post Bookmarked",
      description: `You have bookmarked post ${postId} to view later`,
    });
  };

  const handlePostCreated = (newPost: any) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  if (!user && !isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to MY PUP</h2>
            <p className="text-gray-600 mb-6">Sign in to see your personalized puppy feed</p>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Create Post Section */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Button
                  onClick={() => setShowPostCreator(true)}
                  variant="outline"
                  className="flex-1 justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full border-gray-200"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Share a moment with your community...
                </Button>
                <Button
                  onClick={() => setShowPostCreator(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardContent className="p-4">
                  {/* User Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{post.user.name}</div>
                        <div className="text-xs text-gray-500">{post.timeAgo}</div>
                      </div>
                    </div>
                    <Badge className="rounded-full">{post.user.location}</Badge>
                  </div>

                  {/* Post Image */}
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-md mb-3"
                  />

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => handleLike(post.id)}
                        variant="ghost"
                        size="icon"
                      >
                        <Heart
                          className={`w-5 h-5 ${post.isLiked ? 'text-red-500' : 'text-gray-500'
                            }`}
                        />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="w-5 h-5 text-gray-500" />
                      </Button>
                      <Button onClick={() => handleShare(post.id)} variant="ghost" size="icon">
                        <Share className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                    <Button onClick={() => handleBookmark(post.id)} variant="ghost" size="icon">
                      <Bookmark className="w-5 h-5 text-gray-500" />
                    </Button>
                  </div>

                  {/* Post Caption */}
                  <div className="text-sm">
                    <span className="font-semibold">{post.user.username}</span> {post.caption}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Post Creator Modal */}
      {showPostCreator && (
        <ModernPostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default HomeFeed;
