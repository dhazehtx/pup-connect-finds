
import React, { useState } from 'react';
import { User, Settings, Star, MessageCircle, Heart, Sparkles } from 'lucide-react';
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
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Instagram-style Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-foreground">
                  @{displayProfile.username}
                </h1>
                {displayProfile.verified && (
                  <div className="w-4 h-4 bg-gradient-to-br from-royal-blue to-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-6 space-y-6">
          {/* Profile Header - Instagram style */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-2 ring-border">
                <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-royal-blue to-primary text-white text-lg">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {displayProfile.verified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-royal-blue to-primary rounded-full p-1.5">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-foreground">
                  {displayProfile.full_name}
                </h2>
                {displayProfile.verified && (
                  <Badge variant="secondary" className="bg-royal-blue/10 text-royal-blue border-royal-blue/30 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              
              {displayProfile.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-foreground">{displayProfile.rating}</span>
                  <span className="text-sm text-muted-foreground">({displayProfile.total_reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats - Instagram style */}
          <ProfileStats
            stats={displayProfile.stats}
            onFollowersClick={() => setShowFollowersModal(true)}
            onFollowingClick={() => setShowFollowingModal(true)}
          />

          {/* Bio and Info */}
          <ProfileInfo
            bio={displayProfile.bio}
            location={displayProfile.location}
            website_url={displayProfile.website_url}
            specializations={displayProfile.specializations}
          />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-royal-blue to-primary hover:from-royal-blue/90 hover:to-primary/90 text-white h-9" 
              onClick={() => navigate('/auth')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-border hover:bg-muted h-9"
            >
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </Button>
          </div>

          {/* Posts Grid - Instagram style */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Posts</h3>
              <span className="text-sm text-muted-foreground">{posts.length} posts</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post, index) => (
                <div 
                  key={index} 
                  className="aspect-square cursor-pointer hover:opacity-90 transition-opacity rounded-sm overflow-hidden"
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
          </div>
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

  // Authenticated user view
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {/* Instagram-style Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-foreground">
                @{displayProfile.username}
              </h1>
              {displayProfile.verified && (
                <div className="w-4 h-4 bg-gradient-to-br from-royal-blue to-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-royal-blue hover:bg-royal-blue/10"
              onClick={() => setShowEditDialog(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20 ring-2 ring-border">
              <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-royal-blue to-primary text-white text-lg">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            {displayProfile.verified && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-royal-blue to-primary rounded-full p-1.5">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-foreground">
                {displayProfile.full_name}
              </h2>
              {displayProfile.verified && (
                <Badge variant="secondary" className="bg-royal-blue/10 text-royal-blue border-royal-blue/30 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            {displayProfile.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-foreground">{displayProfile.rating}</span>
                <span className="text-sm text-muted-foreground">({displayProfile.total_reviews} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <ProfileStats
          stats={displayProfile.stats}
          onFollowersClick={() => setShowFollowersModal(true)}
          onFollowingClick={() => setShowFollowingModal(true)}
        />

        {/* Bio and Info */}
        <ProfileInfo
          bio={displayProfile.bio}
          location={displayProfile.location}
          website_url={displayProfile.website_url}
          specializations={displayProfile.specializations}
        />

        {/* Edit Profile Button */}
        <Button 
          variant="outline" 
          className="w-full border-border hover:bg-muted h-9" 
          onClick={() => setShowEditDialog(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>

        {/* Posts Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Your Posts</h3>
            <span className="text-sm text-muted-foreground">{posts.length} posts</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, index) => (
              <div 
                key={index} 
                className="aspect-square cursor-pointer hover:opacity-90 transition-opacity rounded-sm overflow-hidden"
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
        </div>
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
