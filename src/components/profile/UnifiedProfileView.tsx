
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MoreHorizontal, ArrowLeft, MapPin, Share, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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
  const [activeTab, setActiveTab] = useState('photos');

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
    console.log('View public profile clicked');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Only show for non-current users */}
      {!isCurrentUser && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 flex-1 text-center">
                {displayName}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Profile Section */}
        <div className="px-6 py-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200&h=200&fit=crop&crop=face" 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              {!isGuest && !isCurrentUser && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
            
            {/* Stats */}
            <div className="flex items-center space-x-6 mb-4">
              <button 
                onClick={() => handleStatsClick('posts')}
                className="text-center"
              >
                <div className="text-lg font-bold text-gray-900">{profileStats.posts}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </button>
              <button 
                onClick={() => handleStatsClick('followers')}
                className="text-center"
              >
                <div className="text-lg font-bold text-gray-900">{profileStats.followers.toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </button>
              <button 
                onClick={() => handleStatsClick('following')}
                className="text-center"
              >
                <div className="text-lg font-bold text-gray-900">{profileStats.following}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="text-center mb-4">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {isCurrentUser 
                ? "Connecting happy, healthy puppies with loving families 🐾" 
                : "Passionate breeder specializing in Golden Retrievers and Labradors. 🐾 Raising healthy, happy puppies with love."
              }
            </p>
            
            {/* Location */}
            <div className="flex items-center justify-center space-x-1 text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Location Tag, USA</span>
            </div>
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

          {/* Action Buttons */}
          {isCurrentUser ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleEditProfile}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSettings}
                  className="h-12 w-12 rounded-xl border-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="flex-1 h-10 rounded-xl border-gray-300"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewPublicProfile}
                  className="flex-1 h-10 rounded-xl border-gray-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button 
                  onClick={handleMessage}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium"
                >
                  Message
                </Button>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className="flex-1 h-12 rounded-xl font-medium"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Puppy Highlights */}
        {activeTab === 'photos' && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Puppy Highlights</h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                <div className="flex flex-col items-center space-y-2 min-w-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="text-xs text-gray-600 text-center">New</span>
                </div>
                <div className="flex flex-col items-center space-y-2 min-w-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop" 
                      alt="Poodle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-gray-600 text-center">Poodle</span>
                </div>
                <div className="flex flex-col items-center space-y-2 min-w-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop" 
                      alt="Golden Retriever"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-gray-600 text-center">Golden Retriever</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'photos' && (
            <PhotoGrid
              photos={posts}
              onPhotoClick={handlePhotoClick}
              isOwnProfile={isCurrentUser}
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
              {isCurrentUser && (
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
        onFollowToggle={() => {}}
        onPuppyClick={() => {}}
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
              <span className="text-xs text-gray-700">Home</span>
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
              <span className="text-xs text-gray-700">Explore</span>
            </button>
            <button 
              onClick={() => navigate('/create-listing')} 
              className="flex flex-col items-center py-2 relative"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center absolute -top-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
              </div>
              <div className="h-8"></div>
            </button>
            <button 
              onClick={() => navigate('/messages')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700">Messages</span>
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="flex flex-col items-center py-2"
            >
              <div className="w-6 h-6 mb-1">
                <div className={`w-6 h-6 ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-700'} rounded-full`}></div>
              </div>
              <span className={`text-xs ${isCurrentUser ? 'text-blue-600' : 'text-gray-700'}`}>Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default UnifiedProfileView;
