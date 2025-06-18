
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingState from '@/components/ui/loading-state';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import ProfileTabs from '@/components/profile/ProfileTabs';
import PhotoDetailModal from '@/components/profile/PhotoDetailModal';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

const Profile = () => {
  const { user, isGuest } = useAuth();
  const { loading } = useDogListings();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');

  // Sample photo data
  const [posts] = useState<string[]>([
    'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1554692918-0b2d3e93516e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=300&h=300&fit=crop'
  ]);

  // Sample highlights data
  const [highlights] = useState([
    { id: 'new', title: 'New', isNew: true },
    { id: 1, title: 'Poodle', cover: 'https://images.unsplash.com/photo-1616190909555-bfae6efa2b3b?w=100&h=100&fit=crop' },
    { id: 2, title: 'Golden Retriever', cover: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop' },
    { id: 3, title: 'Beagle', cover: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop' },
  ]);

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  const displayName = isGuest 
    ? 'Guest User' 
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Pup';

  const isOwnProfile = user && !isGuest;

  const profileStats = {
    posts: posts.length,
    followers: 10000,
    following: 543
  };

  const handleMessage = () => {
    console.log('Message clicked');
  };

  const handleFollow = () => {
    console.log('Follow clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {displayName.toLowerCase().replace(/\s+/g, '')}
            </h1>
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
          avatarUrl="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop&crop=face"
        />

        {/* Profile Actions */}
        <ProfileActions
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onFollow={handleFollow}
          onShare={handleShare}
        />

        {/* Story Highlights */}
        <ProfileHighlights 
          highlights={highlights} 
          isOwnProfile={isOwnProfile} 
        />

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          posts={posts}
          isOwnProfile={isOwnProfile}
        />
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
