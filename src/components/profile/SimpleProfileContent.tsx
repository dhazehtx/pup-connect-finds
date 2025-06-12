
import React, { useState } from 'react';
import { User, Settings, Star, MessageCircle, Heart, Sparkles, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FollowersModal from '@/components/profile/FollowersModal';
import PostViewModal from '@/components/profile/PostViewModal';
import LikesModal from '@/components/post/LikesModal';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileInfo from '@/components/profile/ProfileInfo';

const SimpleProfileContent = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Demo data for guest users or fallback
  const demoProfile = {
    full_name: 'Golden Paws Kennel',
    username: 'goldenpaws',
    bio: 'Specializing in Golden Retrievers and Labradors for over 15 years. Committed to breeding healthy, well-socialized puppies.',
    location: 'San Francisco, CA',
    phone: '(555) 123-4567',
    website_url: 'https://goldenpaws.com',
    avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
    verified: true,
    rating: 4.9,
    total_reviews: 156,
    years_experience: 15,
    specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
    stats: {
      posts: 24,
      followers: 1245,
      following: 189
    }
  };

  const displayProfile = user && profile ? {
    full_name: profile.full_name || user.email?.split('@')[0] || 'User',
    username: profile.username || user.email?.split('@')[0] || 'user',
    bio: profile.bio || 'Welcome to MY PUP!',
    location: profile.location || '',
    phone: profile.phone || '',
    website_url: profile.website_url || '',
    avatar_url: profile.avatar_url || '',
    verified: profile.verified || false,
    rating: profile.rating || 0,
    total_reviews: profile.total_reviews || 0,
    years_experience: profile.years_experience || 0,
    specializations: profile.specializations || [],
    stats: {
      posts: 0,
      followers: 0,
      following: 0
    }
  } : demoProfile;

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  // Mock followers/following data
  const mockFollowers = [
    { id: '1', full_name: 'Sarah Johnson', username: 'sarahj', avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face', verified: true, user_type: 'breeder' },
    { id: '2', full_name: 'Mike Chen', username: 'mikechen', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', verified: false, user_type: 'buyer' },
    { id: '3', full_name: 'Emma Wilson', username: 'emmaw', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', verified: true, user_type: 'shelter' }
  ];

  const mockFollowing = [
    { id: '4', full_name: 'Dog Rescue Center', username: 'dogrescue', avatar_url: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=150&h=150&fit=crop&crop=face', verified: true, user_type: 'shelter' },
    { id: '5', full_name: 'Puppy Paradise', username: 'puppyparadise', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', verified: true, user_type: 'breeder' }
  ];

  // Mock post likes data
  const mockPostLikes = [
    { id: '1', name: 'Sarah Johnson', username: 'sarahj', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face', verified: true, isFollowing: false },
    { id: '2', name: 'Mike Chen', username: 'mikechen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', verified: false, isFollowing: true },
    { id: '3', name: 'Emma Wilson', username: 'emmaw', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', verified: true, isFollowing: false }
  ];

  const handlePostClick = (postUrl: string) => {
    setSelectedPost(postUrl);
  };

  const handleShowLikes = () => {
    setSelectedPostLikes(mockPostLikes);
    setShowLikesModal(true);
  };

  const handleProfileClick = (userId: string) => {
    console.log('Navigating to profile:', userId);
  };

  if (!user && !profile) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        {/* Enhanced Header with gradient */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 backdrop-blur-md shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white">
                  @{displayProfile.username}
                </h1>
                {displayProfile.verified && (
                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section - Enhanced with cards */}
        <div className="px-4 py-6 space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-200 shadow-lg">
                    <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl">
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>
                  {displayProfile.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {displayProfile.full_name}
                    </h2>
                    {displayProfile.verified && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-md">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {displayProfile.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-800">{displayProfile.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">({displayProfile.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <ProfileStats
                    stats={displayProfile.stats}
                    onFollowersClick={() => setShowFollowersModal(true)}
                    onFollowingClick={() => setShowFollowingModal(true)}
                  />
                </CardContent>
              </Card>

              {/* Bio and Info */}
              <div className="mt-4">
                <ProfileInfo
                  bio={displayProfile.bio}
                  location={displayProfile.location}
                  website_url={displayProfile.website_url}
                  specializations={displayProfile.specializations}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white h-11 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300" 
                  onClick={() => navigate('/auth')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Message
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-11 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Grid Card */}
          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Posts</h3>
                <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-0">
                  {posts.length} posts
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {posts.map((post, index) => (
                  <div 
                    key={index} 
                    className="aspect-square cursor-pointer hover:opacity-90 transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => handlePostClick(post)}
                  >
                    <img 
                      src={post} 
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <FollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          type="followers"
          users={mockFollowers}
          currentUserId={user?.id}
        />
        
        <FollowersModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          type="following"
          users={mockFollowing}
          currentUserId={user?.id}
        />

        {selectedPost && (
          <PostViewModal
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            postUrl={selectedPost}
            onShowLikes={handleShowLikes}
          />
        )}

        <LikesModal
          isOpen={showLikesModal}
          onClose={() => setShowLikesModal(false)}
          likes={selectedPostLikes}
          onProfileClick={handleProfileClick}
        />
      </div>
    );
  }

  // Authenticated user view - Enhanced
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 backdrop-blur-md shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white">
                @{displayProfile.username}
              </h1>
              {displayProfile.verified && (
                <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300"
              onClick={() => setShowEditDialog(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Section - Enhanced */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-blue-200 shadow-lg">
                  <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                {displayProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {displayProfile.full_name}
                  </h2>
                  {displayProfile.verified && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-md">
                      Verified
                    </Badge>
                  )}
                </div>
                
                {displayProfile.rating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-800">{displayProfile.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">({displayProfile.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <ProfileStats
                  stats={displayProfile.stats}
                  onFollowersClick={() => setShowFollowersModal(true)}
                  onFollowingClick={() => setShowFollowingModal(true)}
                />
              </CardContent>
            </Card>

            {/* Bio and Info */}
            <div className="mt-4">
              <ProfileInfo
                bio={displayProfile.bio}
                location={displayProfile.location}
                website_url={displayProfile.website_url}
                specializations={displayProfile.specializations}
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Button Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-11 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300" 
              onClick={() => setShowEditDialog(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Posts Grid Card */}
        <Card className="bg-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Your Posts</h3>
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-0">
                {posts.length} posts
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post, index) => (
                <div 
                  key={index} 
                  className="aspect-square cursor-pointer hover:opacity-90 transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105"
                  onClick={() => handlePostClick(post)}
                >
                  <img 
                    src={post} 
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        type="followers"
        users={mockFollowers}
        currentUserId={user?.id}
      />
      
      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        type="following"
        users={mockFollowing}
        currentUserId={user?.id}
      />

      {selectedPost && (
        <PostViewModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          postUrl={selectedPost}
          onShowLikes={handleShowLikes}
        />
      )}

      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={selectedPostLikes}
        onProfileClick={handleProfileClick}
      />

      {/* Edit Profile Dialog */}
      {showEditDialog && user && profile && (
        <ProfileEditDialog
          profile={profile}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </div>
  );
};

export default SimpleProfileContent;
