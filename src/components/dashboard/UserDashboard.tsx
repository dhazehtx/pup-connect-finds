
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, DollarSign, Bell, Search, Plus, Heart, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();
  const navigate = useNavigate();
  const [activeTransactions] = useState([
    {
      id: '1',
      listingTitle: 'Golden Retriever Puppy - Max',
      status: 'pending_payment',
      amount: 2500,
      seller: 'Sarah Johnson',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      listingTitle: 'French Bulldog - Luna',
      status: 'meeting_scheduled',
      amount: 3200,
      seller: 'Mike Chen',
      createdAt: new Date().toISOString()
    }
  ]);

  const [savedSearches] = useState([
    {
      id: '1',
      name: 'Golden Retrievers under $3000',
      newMatches: 3,
      filters: { breed: 'Golden Retriever', maxPrice: 3000 }
    },
    {
      id: '2',
      name: 'Puppies in Los Angeles',
      newMatches: 7,
      filters: { location: 'Los Angeles', ageGroup: 'puppy' }
    }
  ]);

  const [recentActivity] = useState([
    { id: '1', type: 'favorite', message: 'You saved a listing: German Shepherd Puppy', time: '2 hours ago' },
    { id: '2', type: 'message', message: 'New message from John about Beagle listing', time: '4 hours ago' },
    { id: '3', type: 'price_drop', message: 'Price dropped on saved listing: Poodle Mix', time: '1 day ago' },
    { id: '4', type: 'view', message: 'You viewed 5 new listings', time: '2 days ago' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-500';
      case 'meeting_scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'favorite': return Heart;
      case 'message': return MessageCircle;
      case 'price_drop': return DollarSign;
      case 'view': return Eye;
      default: return Bell;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'User'}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your puppy search</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/explore')}>
            <Search className="mr-2" size={16} />
            Browse Listings
          </Button>
          <Button onClick={() => navigate('/post')}>
            <Plus className="mr-2" size={16} />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
              <MessageCircle className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Transactions</p>
                <p className="text-2xl font-bold">{activeTransactions.length}</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Searches</p>
                <p className="text-2xl font-bold">{savedSearches.length}</p>
              </div>
              <Search className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Matches</p>
                <p className="text-2xl font-bold">{savedSearches.reduce((sum, search) => sum + search.newMatches, 0)}</p>
              </div>
              <Bell className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Messages</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="searches">Saved Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map(activity => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <IconComponent size={16} className="mt-1 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/explore')}>
                    <Search size={24} />
                    <span className="mt-2">Browse Listings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/messages')}>
                    <MessageCircle size={24} />
                    <span className="mt-2">View Messages</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/escrow-dashboard')}>
                    <DollarSign size={24} />
                    <span className="mt-2">Transactions</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/profile')}>
                    <Calendar size={24} />
                    <span className="mt-2">My Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Conversations ({conversations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading conversations...</p>
              ) : conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map(conversation => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{conversation.other_user?.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">
                          {conversation.listing?.dog_name} - {conversation.listing?.breed}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => navigate('/messages')}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active conversations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Status ({activeTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.listingTitle}</p>
                      <p className="text-sm text-gray-600">Seller: {transaction.seller}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">${transaction.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate('/escrow-dashboard')}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedSearches.map(search => (
                  <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{search.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {search.newMatches > 0 && (
                          <Badge className="bg-red-500">
                            {search.newMatches} new matches
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate('/explore')}>
                      View Results
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
