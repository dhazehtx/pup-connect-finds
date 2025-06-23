
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Share, Plus } from 'lucide-react';
import StoriesContainer from '@/components/stories/StoriesContainer';
import CreatePostForm from '@/components/posts/CreatePostForm';

const HomeFeed = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Sample posts data
  const posts = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c66a92a8?w=50&h=50&fit=crop&crop=face',
        username: 'sarah_goldenlove'
      },
      content: 'Just brought home our new Golden Retriever puppy! Any tips for first-time owners? 🐕💕',
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop',
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        username: 'mike_beaglelover'
      },
      content: 'Beautiful day at the dog park! Max made so many new friends today. The socialization is really helping with his confidence. 🌟',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=400&fit=crop',
      likes: 18,
      comments: 5,
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      user: {
        name: 'Pet Paradise Rescue',
        avatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop',
        username: 'petparadise_rescue'
      },
      content: 'Meet Luna! This sweet 2-year-old Labrador mix is looking for her forever home. She\'s great with kids and other dogs. 🏡❤️',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=400&fit=crop',
      likes: 42,
      comments: 12,
      timeAgo: '6 hours ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-4">
        {/* Stories Section */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <StoriesContainer />
        </div>

        {/* Create Post Section */}
        {user && (
          <Card className="border-blue-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-gray-500"
                  onClick={() => setShowCreatePost(true)}
                >
                  Share something about your pup...
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowCreatePost(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <CreatePostForm
              onClose={() => setShowCreatePost(false)}
              onSubmit={() => setShowCreatePost(false)}
            />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-blue-200 shadow-sm">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                    <p className="text-sm text-gray-500">@{post.user.username} • {post.timeAgo}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-900">{post.content}</p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                  />
                )}

                {/* Post Actions */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default HomeFeed;
