
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dog, Heart, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, profile, signOut } = useAuth();

  const stats = [
    { icon: Dog, label: 'Active Listings', value: '1,234' },
    { icon: Users, label: 'Breeders', value: '456' },
    { icon: Heart, label: 'Happy Matches', value: '2,890' },
    { icon: MessageCircle, label: 'Messages Today', value: '156' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name || user?.email}!</h1>
            <p className="text-gray-600 mt-2">Find your perfect furry companion</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Explore Dogs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Browse available dogs from verified breeders</p>
              <Link to="/explore">
                <Button className="w-full">Browse Listings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Connect with breeders and buyers</p>
              <Link to="/messages">
                <Button className="w-full" variant="outline">View Messages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your profile and preferences</p>
              <Link to="/profile">
                <Button className="w-full" variant="outline">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
