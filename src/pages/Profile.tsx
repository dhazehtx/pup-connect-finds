
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Star, MapPin, Calendar, Edit, Trash2, Grid, MoreHorizontal, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingState from '@/components/ui/loading-state';

const Profile = () => {
  const { user, isGuest } = useAuth();
  const { userListings, loading, deleteListing } = useDogListings();

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(listingId);
    }
  };

  const displayName = isGuest 
    ? 'Guest User' 
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const displayEmail = isGuest ? 'guest@mypup.com' : user?.email;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Instagram-style Profile Header */}
        <div className="mb-8">
          <div className="flex items-start gap-8 mb-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-normal text-gray-900">{displayName}</h1>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <span className="font-semibold text-gray-900">{userListings.length}</span>
                  <span className="text-gray-500 ml-1">posts</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900">0</span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900">0</span>
                  <span className="text-gray-500 ml-1">following</span>
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">{displayName}</p>
                <p className="text-gray-600 text-sm">{displayEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {isGuest ? 'Guest' : 'Verified'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Highlights Placeholder */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-2 min-w-[60px]">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-xs text-gray-500">New</span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-t">
          <div className="flex justify-center">
            <div className="flex">
              <button className="flex items-center gap-1 px-4 py-3 border-t-2 border-gray-900 text-gray-900">
                <Grid className="w-3 h-3" />
                <span className="text-xs font-medium uppercase tracking-wider">Posts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mt-6">
          {userListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 border-2 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">Share Photos</h3>
              <p className="text-gray-500 mb-4">When you share photos, they will appear on your profile.</p>
              <Link to="/create-listing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Share your first photo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {userListings.map((listing) => (
                <div key={listing.id} className="aspect-square relative group">
                  <img
                    src={listing.image_url || '/placeholder.svg'}
                    alt={listing.dog_name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-white" />
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-5 h-5 fill-white" />
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu button */}
                  <button className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
