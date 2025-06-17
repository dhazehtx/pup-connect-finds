
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Star, MapPin, Calendar, Edit, Grid, MoreHorizontal, Heart, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingState from '@/components/ui/loading-state';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import PostForm from '@/components/posts/PostForm';
import PostFeed from '@/components/posts/PostFeed';
import PremiumUpgradePrompt from '@/components/profile/PremiumUpgradePrompt';

const Profile = () => {
  const { user, isGuest } = useAuth();
  const { userListings, loading, deleteListing } = useDogListings();
  const [refreshPosts, setRefreshPosts] = useState(0);

  // Sample highlights data - in production this would come from Supabase
  const [highlights, setHighlights] = useState([
    { id: 1, title: 'Puppies', cover: '/placeholder.svg', type: 'image' as const },
    { id: 2, title: 'Training', cover: '/placeholder.svg', type: 'image' as const },
    { id: 3, title: 'Health', cover: '/placeholder.svg', type: 'image' as const },
    { id: 4, title: 'Reviews', cover: '/placeholder.svg', type: 'image' as const },
    // Add the "New" highlight for authenticated users
    ...(user && !isGuest ? [{ id: 'new', title: 'New', cover: '', isNew: true }] : [])
  ]);

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

  const handlePostCreated = () => {
    setRefreshPosts(prev => prev + 1);
  };

  const displayName = isGuest 
    ? 'Guest User' 
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const displayEmail = isGuest ? 'guest@mypup.com' : user?.email;

  const isOwnProfile = user && !isGuest; // Only show add button for authenticated users

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {displayName.toLowerCase().replace(/\s+/g, '')}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Profile Header Section */}
        <div className="px-4 py-6">
          <div className="flex items-start space-x-4 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex-1">
              <div className="flex justify-around text-center">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{userListings.length}</div>
                  <div className="text-gray-600 text-sm">posts</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">0</div>
                  <div className="text-gray-600 text-sm">followers</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">0</div>
                  <div className="text-gray-600 text-sm">following</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">{displayName}</h2>
            <p className="text-gray-600 text-sm mb-2">{displayEmail}</p>
            <p className="text-gray-900 text-sm mb-3">
              Selective free resources for designers @mypup.<br />
              Melbourne, Victoria, Australia
            </p>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {isGuest ? 'Guest' : 'Verified'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              size="sm"
            >
              Follow
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="px-4"
            >
              ▼
            </Button>
          </div>

          {/* Premium Upgrade Prompt - Only for authenticated users */}
          {isOwnProfile && <PremiumUpgradePrompt />}

          {/* Story Highlights */}
          <ProfileHighlights highlights={highlights} isOwnProfile={isOwnProfile} />

          {/* Explore Services Link */}
          <div className="text-center mb-6">
            <Link to="/explore" className="text-blue-500 font-medium">
              Explore Pet Services
            </Link>
          </div>
        </div>

        {/* Post Form - Only for authenticated users */}
        {isOwnProfile && (
          <div className="px-4">
            <PostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-t border-gray-200">
          <div className="flex">
            <button className="flex-1 flex items-center justify-center py-3 border-t-2 border-gray-900">
              <Grid className="w-6 h-6 text-gray-900" />
            </button>
            <button className="flex-1 flex items-center justify-center py-3">
              <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
            </button>
            <button className="flex-1 flex items-center justify-center py-3">
              <User className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="px-4">
          <PostFeed 
            userId={user?.id} 
            refreshTrigger={refreshPosts}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            <Link to="/home" className="flex flex-col items-center py-2">
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-700">
                  <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"/>
                </svg>
              </div>
            </Link>
            <Link to="/explore" className="flex flex-col items-center py-2">
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </Link>
            <Link to="/create-listing" className="flex flex-col items-center py-2">
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M9 12h6m-3-3v6"/>
                </svg>
              </div>
            </Link>
            <Link to="/messages" className="flex flex-col items-center py-2">
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </Link>
            <Link to="/profile" className="flex flex-col items-center py-2">
              <div className="w-6 h-6 mb-1">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default Profile;
