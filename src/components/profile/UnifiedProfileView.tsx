
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileActions from '@/components/profile/ProfileActions';
import PhotoGrid from '@/components/profile/PhotoGrid';
import PostDetailModal from '@/components/profile/PostDetailModal';
import StatsModal from '@/components/profile/StatsModal';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  breed?: string;
  age?: string;
  tags?: string[];
  datePosted?: string;
}

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following' | 'puppies';
  }>({ isOpen: false, type: 'followers' });
  const [isFollowing, setIsFollowing] = useState(false);

  // Sample photo data
  const [posts] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
      caption: 'Beautiful Golden Retriever puppy looking for a loving home!',
      breed: 'Golden Retriever',
      age: '8 weeks',
      tags: ['puppy', 'golden', 'playful'],
      datePosted: '2 days ago'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
      caption: 'Adorable Beagle puppy ready for adoption',
      breed: 'Beagle',
      age: '10 weeks',
      tags: ['beagle', 'cute', 'friendly'],
      datePosted: '1 week ago'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
      breed: 'Labrador',
      age: '12 weeks'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
      breed: 'German Shepherd',
      age: '6 weeks'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
      breed: 'Husky',
      age: '9 weeks'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop',
      breed: 'Poodle',
      age: '7 weeks'
    }
  ]);

  // Sample data for modals
  const sampleFollowers = [
    { id: '1', name: 'Sarah Johnson', username: 'sarah_j', verified: true },
    { id: '2', name: 'Mike Davis', username: 'mike_d' },
    { id: '3', name: 'Emma Wilson', username: 'emma_w', verified: true }
  ];

  const samplePuppies = [
    {
      id: '1',
      name: 'Max',
      breed: 'Golden Retriever',
      age: '8 weeks',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200&h=200&fit=crop'
    },
    {
      id: '2',
      name: 'Bella',
      breed: 'Beagle',
      age: '10 weeks',
      price: 800,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&fit=crop'
    }
  ];

  // Determine display name and profile data
  const displayName = isCurrentUser 
    ? (isGuest ? 'Guest User' : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Profile')
    : 'Golden Paws Kennel'; // In real app, this would come from API

  const profileStats = {
    posts: posts.length,
    followers: 1247,
    following: 543
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${displayName}'s Profile`,
        url: window.location.href
      });
    }
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleVisitListings = () => {
    navigate('/explore');
  };

  const handleStatsClick = (type: 'posts' | 'followers' | 'following') => {
    if (type === 'posts') {
      return;
    }
    setStatsModal({ isOpen: true, type: type as 'followers' | 'following' });
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoLongPress = (photo: Photo) => {
    console.log('Long press on photo:', photo.id);
  };

  const handleFollowToggle = (userId: string) => {
    console.log('Toggle follow for user:', userId);
  };

  const handlePuppyClick = (puppyId: string) => {
    navigate(`/listings/${puppyId}`);
  };

  const handleCreatePost = () => {
    navigate('/create-listing');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {!isCurrentUser && (
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-900 flex-1 text-center">
              {isCurrentUser ? displayName.toLowerCase().replace(/\s+/g, '') : displayName}
            </h1>
            <div className="flex items-center space-x-2">
              {isCurrentUser && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <ProfileHeader
          displayName={displayName}
          location="San Francisco, CA"
          bio={isCurrentUser 
            ? "Your bio appears here. Edit your profile to add one!" 
            : "Passionate breeder specializing in Golden Retrievers and Labradors. 🐾 Raising healthy, happy puppies with love."
          }
          isVerified={!isGuest && !isCurrentUser}
          stats={profileStats}
          avatarUrl="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop&crop=face"
          onStatsClick={handleStatsClick}
        />

        {/* Profile Actions */}
        <ProfileActions
          isOwnProfile={isCurrentUser}
          onMessage={handleMessage}
          onFollow={handleFollow}
          onShare={handleShare}
          onEditProfile={handleEditProfile}
          onVisitListings={handleVisitListings}
          isFollowing={isFollowing}
        />

        {/* Create Post Button - Only for own profile */}
        {isCurrentUser && user && !isGuest && (
          <div className="px-6 mb-6">
            <Button 
              onClick={handleCreatePost}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-medium"
            >
              Add New Puppy Listing
            </Button>
          </div>
        )}

        {/* Photo Grid */}
        <PhotoGrid
          photos={posts}
          onPhotoClick={handlePhotoClick}
          onPhotoLongPress={handlePhotoLongPress}
          isOwnProfile={isCurrentUser}
        />
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        photo={selectedPhoto}
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setSelectedPhoto(null);
        }}
        isOwnPost={isCurrentUser}
        onEdit={() => console.log('Edit post')}
        onDelete={() => console.log('Delete post')}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal({ ...statsModal, isOpen: false })}
        type={statsModal.type}
        data={statsModal.type === 'puppies' ? samplePuppies : sampleFollowers}
        onFollowToggle={handleFollowToggle}
        onPuppyClick={handlePuppyClick}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            <button 
              onClick={() => navigate('/home')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-700">
                  <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"/>
                </svg>
              </div>
            </button>
            <button 
              onClick={() => navigate('/explore')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </button>
            <button 
              onClick={() => navigate('/create-listing')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M9 12h6m-3-3v6"/>
                </svg>
              </div>
            </button>
            <button 
              onClick={() => navigate('/messages')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <div className={`w-6 h-6 ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-700'} rounded-full`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default UnifiedProfileView;
