
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import RecommendationEngine from '@/components/ai/RecommendationEngine';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const { userListings } = useDogListings();
  const { conversations } = useMessaging();
  const [showAnalytics, setShowAnalytics] = useState(false);

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
