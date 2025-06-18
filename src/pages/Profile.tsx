
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, MoreHorizontal, Grid, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingState from '@/components/ui/loading-state';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileActions from '@/components/profile/ProfileActions';
import PhotoGrid from '@/components/profile/PhotoGrid';
import PhotoDetailModal from '@/components/profile/PhotoDetailModal';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import PostForm from '@/components/posts/PostForm';
import PostFeed from '@/components/posts/PostFeed';
import PremiumUpgradePrompt from '@/components/profile/PremiumUpgradePrompt';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

const Profile = () => {
  const { user, isGuest } = useAuth();
  const { userListings, loading, deleteListing } = useDogListings();
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');

  // Sample photo data - replace with actual data from your backend
  const [photos] = useState<Photo[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop', caption: 'Beautiful Golden Retriever puppy' },
    { id: '2', url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop', caption: 'Training session with Max' },
    { id: '3', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', caption: 'Puppy playtime' },
    { id: '4', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop', caption: 'Health check with vet' },
    { id: '5', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop', caption: 'Happy family adoption' },
    { id: '6', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop', caption: 'New litter announcement' },
  ]);

  // Sample highlights data
  const [highlights] = useState([
    { id: 1, title: 'Puppies', cover: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop', type: 'image' as const },
    { id: 2, title: 'Training', cover: 'https://images.unsplash.com/photo-1551717758536-85ae29035b6d?w=100&h=100&fit=crop', type: 'image' as const },
    { id: 3, title: 'Health', cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop', type: 'image' as const },
    { id: 4, title: 'Reviews', cover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop', type: 'image' as const },
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

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleMessage = () => {
    // Implement messaging functionality
    console.log('Message clicked');
  };

  const handleFollow = () => {
    // Implement follow functionality
    console.log('Follow clicked');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share clicked');
  };

  const displayName = isGuest 
    ? 'Guest User' 
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const isOwnProfile = user && !isGuest;

  const profileStats = {
    posts: photos.length,
    followers: 10000,
    following: 543
  };

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
        {/* Profile Header */}
        <ProfileHeader
          displayName={displayName}
          location="Location Tag, USA"
          bio="Connecting happy, healthy puppies with loving families 🐾"
          isVerified={!isGuest}
          stats={profileStats}
        />

        {/* Profile Actions */}
        <ProfileActions
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onFollow={handleFollow}
          onShare={handleShare}
        />

        {/* Premium Upgrade Prompt - Only for authenticated users */}
        {isOwnProfile && <PremiumUpgradePrompt />}

        {/* Story Highlights */}
        <div className="px-4 mb-6">
          <ProfileHighlights highlights={highlights} isOwnProfile={isOwnProfile} />
        </div>

        {/* Post Form - Only for authenticated users */}
        {isOwnProfile && (
          <div className="px-4 mb-6">
            <PostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-t border-gray-200 mb-6">
          <div className="flex">
            <button 
              className={`flex-1 flex items-center justify-center py-3 ${
                activeTab === 'grid' ? 'border-t-2 border-gray-900' : ''
              }`}
              onClick={() => setActiveTab('grid')}
            >
              <Grid className={`w-6 h-6 ${activeTab === 'grid' ? 'text-gray-900' : 'text-gray-400'}`} />
            </button>
            <button 
              className={`flex-1 flex items-center justify-center py-3 ${
                activeTab === 'feed' ? 'border-t-2 border-gray-900' : ''
              }`}
              onClick={() => setActiveTab('feed')}
            >
              <div className={`w-6 h-6 border-2 rounded ${activeTab === 'feed' ? 'border-gray-900' : 'border-gray-400'}`}></div>
            </button>
            <button 
              className={`flex-1 flex items-center justify-center py-3 ${
                activeTab === 'tagged' ? 'border-t-2 border-gray-900' : ''
              }`}
              onClick={() => setActiveTab('tagged')}
            >
              <User className={`w-6 h-6 ${activeTab === 'tagged' ? 'text-gray-900' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'grid' && (
          <PhotoGrid 
            photos={photos} 
            onPhotoClick={handlePhotoClick}
          />
        )}

        {activeTab === 'feed' && (
          <div className="px-4">
            <PostFeed 
              userId={user?.id} 
              refreshTrigger={refreshPosts}
            />
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="px-4 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tagged Posts</h3>
            <p className="text-gray-500">Posts you're tagged in will appear here.</p>
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setSelectedPhoto(null);
        }}
      />

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
