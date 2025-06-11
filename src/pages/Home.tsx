
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Users, MessageCircle, Heart, Search, MoreHorizontal, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import RecommendationEngine from '@/components/ai/RecommendationEngine';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { userListings } = useDogListings();
  const { conversations } = useMessaging();
  const { isMobile } = useMobileOptimized();
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Mobile feed design for authenticated users
  if (isMobile) {
    return (
      <div className="bg-white min-h-screen">
        {/* Stories Section */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-3 overflow-x-auto">
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs mt-1 block">Your Story</span>
            </div>
            {/* Sample story items */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-0.5">
                  <div className="w-full h-full bg-gray-200 rounded-full"></div>
                </div>
                <span className="text-xs mt-1 block">User {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-0">
          {/* Sample post */}
          <div className="bg-white border-b border-gray-200">
            {/* Post header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="font-semibold text-sm">goldenpaws_official</span>
                  <div className="text-xs text-gray-500">San Francisco, CA</div>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </div>

            {/* Post image */}
            <div className="aspect-square bg-gray-100">
              <img 
                src="/lovable-uploads/3ae80125-17a2-47bf-85a7-2e69d508dee0.png" 
                alt="Golden retriever in field"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post actions */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-4">
                <Heart className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
                <Search className="w-6 h-6" />
              </div>
              <Bookmark className="w-6 h-6" />
            </div>

            {/* Post info */}
            <div className="px-3 pb-3">
              <div className="font-semibold text-sm mb-1">128 likes</div>
              <div className="text-sm">
                <span className="font-semibold">goldenpaws_official</span> Beautiful day at the park! This sweet husky is looking for a loving home. 🐕 #AdoptDontShop
              </div>
              <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
            </div>
          </div>

          {/* More sample posts */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <div>
                  <span className="font-semibold text-sm">puppy_paradise</span>
                  <div className="text-xs text-gray-500">Los Angeles, CA</div>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </div>

            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sample Dog Photo</span>
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-4">
                <Heart className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
                <Search className="w-6 h-6" />
              </div>
              <Bookmark className="w-6 h-6" />
            </div>

            <div className="px-3 pb-3">
              <div className="font-semibold text-sm mb-1">64 likes</div>
              <div className="text-sm">
                <span className="font-semibold">puppy_paradise</span> Meet Luna! She's a 3-month-old golden retriever ready for her forever family ✨
              </div>
              <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show guest homepage for non-authenticated users
  if (!user && !isGuest) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
                <Search className="w-5 h-5 mr-2" />
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

        {/* Features for Guests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">
                Browse hundreds of dogs from verified breeders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Directly</h3>
              <p className="text-gray-600">
                Message breeders and ask questions about their dogs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trusted Community</h3>
              <p className="text-gray-600">
                Join a community of verified breeders and dog lovers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop authenticated user homepage
  const stats = {
    listings: userListings.length,
    conversations: conversations.length,
    views: userListings.reduce((sum, listing) => sum + (Math.floor(Math.random() * 100) + 50), 0),
    responses: Math.floor(conversations.length * 0.7)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.email?.split('@')[0] || 'Friend'}! 👋
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover amazing dogs and connect with trusted breeders
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/post">
              <PlusCircle className="w-5 h-5 mr-2" />
              List a Dog
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/explore">
              Browse Dogs
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Listings</p>
                <p className="text-2xl font-bold">{stats.listings}</p>
              </div>
              <PlusCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-2xl font-bold">{stats.conversations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{stats.views}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold">{stats.responses}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Analytics */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button 
          variant="outline" 
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </Button>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && <AnalyticsDashboard />}

      {/* AI Recommendations */}
      <RecommendationEngine />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {userListings.length === 0 ? (
              <div className="text-center py-8">
                <PlusCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first listing to start connecting with buyers
                </p>
                <Button asChild>
                  <Link to="/post">Create Listing</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userListings.slice(0, 3).map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {listing.image_url && (
                      <img
                        src={listing.image_url}
                        alt={listing.dog_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.dog_name}</h4>
                      <p className="text-sm text-gray-600">{listing.breed}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${listing.price}</p>
                      <p className="text-xs text-gray-500">{listing.status}</p>
                    </div>
                  </div>
                ))}
                {userListings.length > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/profile">View All Listings</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">
                  Start browsing dogs to connect with breeders
                </p>
                <Button asChild>
                  <Link to="/explore">Browse Dogs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.slice(0, 3).map((conversation) => (
                  <div key={conversation.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {conversation.other_user?.full_name || 'Anonymous'}
                      </h4>
                      {conversation.listing && (
                        <p className="text-sm text-gray-600">
                          About: {conversation.listing.dog_name}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {conversation.last_message_at 
                        ? new Date(conversation.last_message_at).toLocaleDateString()
                        : 'New'
                      }
                    </div>
                  </div>
                ))}
                {conversations.length > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/messages">View All Messages</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
