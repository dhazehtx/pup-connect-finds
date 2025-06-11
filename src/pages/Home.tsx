
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, isGuest } = useAuth();

  // Sample posts data to recreate the demo layout
  const posts = [
    {
      id: 1,
      user: {
        username: 'goldenpaws_official',
        location: 'San Francisco, CA',
        avatar: '/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png'
      },
      image: '/lovable-uploads/e5a0f017-3263-4e2a-b8eb-c15611287ed7.png',
      likes: 1234,
      caption: 'Beautiful day at the park! 🐕',
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      user: {
        username: 'happypuppies',
        location: 'Los Angeles, CA',
        avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png'
      },
      image: '/lovable-uploads/3ae80125-17a2-47bf-85a7-2e69d508dee0.png',
      likes: 856,
      caption: 'Training session complete! Good boy! 🎾',
      timeAgo: '4 hours ago'
    },
    {
      id: 3,
      user: {
        username: 'dogloversclub',
        location: 'New York, NY',
        avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png'
      },
      image: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
      likes: 642,
      caption: 'Playtime with friends! 🐾',
      timeAgo: '6 hours ago'
    }
  ];

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

  // Main social media feed layout like in the demo
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => (
          <Card key={post.id} className="rounded-none border-x-0 border-t-0 shadow-none">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{post.user.username}</p>
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
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Heart className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <MessageCircle className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Share className="w-6 h-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Bookmark className="w-6 h-6" />
                  </Button>
                </div>

                {/* Likes */}
                <p className="font-semibold text-sm mb-1">
                  {post.likes.toLocaleString()} likes
                </p>

                {/* Caption */}
                <p className="text-sm">
                  <span className="font-semibold">{post.user.username}</span>{' '}
                  {post.caption}
                </p>

                {/* Time */}
                <p className="text-xs text-gray-500 mt-1">{post.timeAgo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
