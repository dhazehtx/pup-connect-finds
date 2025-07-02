
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Share, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoriesContainer from '@/components/stories/StoriesContainer';
import CreatePostDropdown from '@/components/posts/CreatePostDropdown';

const HomeFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample posts data
  const posts = [
    {
      id: '1',
      user: {
        id: 'sarah_goldenlove',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c66a92a8?w=50&h=50&fit=crop&crop=face',
        username: 'sarah_goldenlove'
      },
      content: 'Just brought home our new Golden Retriever puppy! Any tips for first-time owners? 🐕💕',
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop',
      likes: 24,
      isLiked: false,
      comments: [
        { id: 1, user: 'Mike C.', text: 'So adorable! Congrats!' },
        { id: 2, user: 'Emma W.', text: 'Start with basic training early 🐾' },
        { id: 3, user: 'Alex M.', text: 'Beautiful pup! Golden retrievers are the best.' },
        { id: 4, user: 'Lisa K.', text: 'Make sure to socialize early!' }
      ],
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      user: {
        id: 'mike_beaglelover',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        username: 'mike_beaglelover'
      },
      content: 'Beautiful day at the dog park! Max made so many new friends today. The socialization is really helping with his confidence. 🌟',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=400&fit=crop',
      likes: 18,
      isLiked: true,
      comments: [
        { id: 1, user: 'Sarah J.', text: 'Max looks so happy!' },
        { id: 2, user: 'Pet Paradise', text: 'Socialization is key! Great job.' }
      ],
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      user: {
        id: 'petparadise_rescue',
        name: 'Pet Paradise Rescue',
        avatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop',
        username: 'petparadise_rescue'
      },
      content: 'Meet Luna! This sweet 2-year-old Labrador mix is looking for her forever home. She\'s great with kids and other dogs. 🏡❤️',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=400&fit=crop',
      likes: 42,
      isLiked: false,
      comments: [
        { id: 1, user: 'Lisa K.', text: 'Is she still available?' },
        { id: 2, user: 'Tom R.', text: 'What a sweetheart!' },
        { id: 3, user: 'Anna M.', text: 'Sharing this post!' }
      ],
      timeAgo: '6 hours ago'
    }
  ];

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewAllComments = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Search and Post Button */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-900 flex-shrink-0">MY PUP</h1>
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Post Button */}
            {user && (
              <div className="relative flex-shrink-0">
                <Button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="w-10 h-10 rounded-full p-0 shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 text-white" />
                </Button>
                
                <CreatePostDropdown 
                  isOpen={showCreateDropdown}
                  onClose={() => setShowCreateDropdown(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-4">
        {/* Stories Section */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <StoriesContainer />
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-sm border-gray-200">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProfileClick(post.user.id)}
                  />
                  <div className="flex-1">
                    <h3 
                      className="font-semibold text-gray-900 cursor-pointer hover:underline"
                      onClick={() => handleProfileClick(post.user.id)}
                    >
                      {post.user.name}
                    </h3>
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

                {/* Post Actions - Updated with high contrast colors */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-6">
                      <button 
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-red-600' : 'text-gray-800 hover:text-red-600'
                        }`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors"
                        onClick={() => handleViewAllComments(post.id)}
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm font-medium">{post.comments.length}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors">
                        <Share className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Comments Preview - Show top 3 comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-medium text-gray-900">{comment.user}</span>
                          <span className="text-gray-700 ml-2">{comment.text}</span>
                        </div>
                      ))}
                      {post.comments.length > 3 && (
                        <button 
                          onClick={() => handleViewAllComments(post.id)}
                          className="text-sm font-medium text-blue-600 hover:underline transition-colors"
                        >
                          View all {post.comments.length} comments
                        </button>
                      )}
                    </div>
                  )}
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
