import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PhotoGrid from '@/components/profile/PhotoGrid';
import PostDetailModal from '@/components/profile/PostDetailModal';
import StatsModal from '@/components/profile/StatsModal';
import ProfileStats from '@/components/profile/ProfileStats';
import PublicViewBanner from '@/components/profile/PublicViewBanner';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileActionButtons from '@/components/profile/ProfileActionButtons';
import PuppyHighlights from '@/components/profile/PuppyHighlights';
import TabsNavigation from '@/components/profile/TabsNavigation';
import BottomNavigation from '@/components/profile/BottomNavigation';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('photos');
  const [isPublicView, setIsPublicView] = useState(false);

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
    ? (isGuest ? 'Guest User' : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Pup')
    : 'Golden Paws Kennel';

  const profileStats = {
    posts: posts.length,
    followers: 10000,
    following: 543
  };

  // Badges for current user
  const userBadges = isCurrentUser ? [
    { name: 'Verified Breeder', color: 'bg-blue-100 text-blue-800' },
    { name: 'Adoption Activity', color: 'bg-green-100 text-green-800' }
  ] : [
    { name: 'Verified Breeder', color: 'bg-blue-100 text-blue-800' },
    { name: 'Top Rated Seller', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Health Guarantee Provider', color: 'bg-purple-100 text-purple-800' }
  ];

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

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleViewPublicProfile = () => {
    setIsPublicView(true);
  };

  const handleExitPublicView = () => {
    setIsPublicView(false);
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

  const handleCreatePost = () => {
    navigate('/create-listing');
  };

  const tabs = [
    { id: 'photos', label: 'Photos' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'listings', label: 'Listings' }
  ];

  const showHeader = !isCurrentUser || isPublicView;
  const showPuppyHighlights = activeTab === 'photos' && isCurrentUser && !isPublicView;
  const showBottomNavigation = !isPublicView;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicViewBanner 
        isVisible={isPublicView} 
        onExit={handleExitPublicView} 
      />

      <ProfileHeader 
        displayName={displayName}
        showHeader={showHeader}
        onBack={() => isPublicView ? handleExitPublicView() : navigate(-1)}
      />

      {/* Main Content Container */}
      <div className="w-full max-w-md mx-auto bg-white min-h-screen">
        {/* Profile Section */}
        <div className="px-6 py-6">
          <ProfileInfo 
            displayName={displayName}
            isGuest={isGuest}
            isCurrentUser={isCurrentUser}
            isPublicView={isPublicView}
            userBadges={userBadges}
          />

          {/* Stats */}
          <ProfileStats
            stats={profileStats}
            onFollowersClick={() => handleStatsClick('followers')}
            onFollowingClick={() => handleStatsClick('following')}
          />

          {/* Bio Section - Positioned after stats */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {isCurrentUser && !isPublicView
                ? "Connecting happy, healthy puppies with loving families 🐾" 
                : "Passionate breeder specializing in Golden Retrievers and Labradors. 🐾 Raising healthy, happy puppies with love."
              }
            </p>
            
            {/* Location */}
            <div className="flex items-center justify-center space-x-1 text-gray-600 mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Location Tag, USA</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {userBadges.map((badge, index) => (
                <Badge key={index} className={`text-xs ${badge.color} border-0`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <ProfileActionButtons
            isCurrentUser={isCurrentUser}
            isPublicView={isPublicView}
            isFollowing={isFollowing}
            onEditProfile={handleEditProfile}
            onSettings={handleSettings}
            onShare={handleShare}
            onViewPublicProfile={handleViewPublicProfile}
            onMessage={handleMessage}
            onFollow={handleFollow}
          />
        </div>

        <TabsNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <PuppyHighlights showHighlights={showPuppyHighlights} />

        {/* Tab Content */}
        <div className="relative">
          {activeTab === 'photos' && (
            <PhotoGrid
              photos={posts}
              onPhotoClick={handlePhotoClick}
              isOwnProfile={isCurrentUser && !isPublicView}
            />
          )}
          
          {activeTab === 'reviews' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">Reviews from customers will appear here.</p>
            </div>
          )}
          
          {activeTab === 'listings' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
              <p className="text-gray-500">Active listings will appear here.</p>
              {isCurrentUser && !isPublicView && (
                <Button 
                  onClick={handleCreatePost}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add New Listing
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        photo={selectedPhoto}
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setSelectedPhoto(null);
        }}
        isOwnPost={isCurrentUser && !isPublicView}
        onEdit={() => console.log('Edit post')}
        onDelete={() => console.log('Delete post')}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal({ ...statsModal, isOpen: false })}
        type={statsModal.type}
        data={statsModal.type === 'puppies' ? samplePuppies : sampleFollowers}
        onFollowToggle={() => {}}
        onPuppyClick={() => {}}
      />

      <BottomNavigation 
        isCurrentUser={isCurrentUser}
        show={showBottomNavigation}
      />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default UnifiedProfileView;
