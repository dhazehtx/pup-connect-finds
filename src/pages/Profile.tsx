import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBadges from '@/components/profile/ProfileBadges';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';
import ProfileCompletionGuide from '@/components/profile/ProfileCompletionGuide';
import MobileProfileHeader from '@/components/profile/MobileProfileHeader';
import ProfileErrorBoundary from '@/components/profile/ProfileErrorBoundary';
import ProfileAnalyticsEnhanced from '@/components/profile/ProfileAnalyticsEnhanced';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useRealtimeVerification } from '@/hooks/useRealtimeVerification';
import { UserProfile } from '@/types/profile';

const Profile = () => {
  const { userId } = useParams();
  const { user, profile, loading } = useAuth();
  const { isMobile } = useMobileOptimized();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCompletionGuide, setShowCompletionGuide] = useState(true);
  
  // Initialize real-time verification notifications
  useRealtimeVerification();
  
  // Check if this is the current user's profile or another user's profile
  const isOwnProfile = !userId || userId === user?.id;
  
  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Use current user's profile data or create a default profile structure
  const displayProfile: UserProfile = isOwnProfile && profile ? {
    id: profile.id,
    username: profile.username,
    full_name: profile.fullName || profile.full_name,
    email: user?.email || '',
    bio: profile.bio,
    location: profile.location,
    avatar_url: profile.avatarUrl || profile.avatar_url,
    user_type: profile.userType || profile.user_type || 'buyer',
    verified: profile.verified || false,
    verification_badges: profile.verified ? [
      { type: 'ID Verified', verified_at: new Date().toISOString() }
    ] : [],
    years_experience: profile.yearsExperience || profile.years_experience || 0,
    rating: profile.rating || 0,
    total_reviews: profile.totalReviews || profile.total_reviews || 0,
    specializations: [],
    certifications: [],
    phone: profile.phone,
    website_url: profile.websiteUrl || profile.website_url,
    social_links: profile.social_links || {},
    privacy_settings: profile.privacy_settings || {
      show_bio: true,
      show_email: false,
      show_phone: false,
      show_location: true,
      show_social_links: true
    },
    stats: {
      followers: 0,
      following: 0,
      posts: 0,
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0
    },
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || new Date().toISOString()
  } : {
    // Default profile for non-logged in users or other users
    id: userId || 'unknown',
    username: 'goldenpaws',
    full_name: "Golden Paws Kennel",
    email: 'contact@goldenpaws.com',
    bio: "Specializing in Golden Retrievers and Labradors for over 15 years. All our puppies are health tested and come with health guarantees.",
    location: "San Francisco, CA",
    avatar_url: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    user_type: 'breeder',
    verified: true,
    verification_badges: [
      { type: 'ID Verified', verified_at: '2024-01-01T00:00:00Z' },
      { type: 'Licensed Breeder', verified_at: '2024-01-01T00:00:00Z' },
      { type: 'Vet Reviewed', verified_at: '2024-01-01T00:00:00Z' }
    ],
    years_experience: 15,
    rating: 4.9,
    total_reviews: 156,
    specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
    certifications: [
      'AKC Registered Breeder',
      'USDA Licensed',
      'Veterinary Health Certificate'
    ],
    phone: '+1 (555) 123-4567',
    website_url: 'www.goldenpaws.com',
    social_links: {},
    privacy_settings: {
      show_bio: true,
      show_email: false,
      show_phone: true,
      show_location: true,
      show_social_links: true
    },
    stats: {
      followers: 1248,
      following: 342,
      posts: 47,
      totalListings: 12,
      activeListings: 8,
      totalViews: 15420,
      totalInquiries: 89
    },
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const highlights = [
    {
      id: 'new',
      title: 'New',
      cover: '',
      isNew: true
    },
    {
      id: 1,
      title: 'Puppies',
      cover: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      title: 'Training',
      cover: 'https://images.unsplash.com/photo-1551717758536-85ae29035b6d?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      title: 'Health',
      cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      title: 'Reviews',
      cover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop'
    }
  ];

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Amazing experience! Our Golden Retriever puppy is healthy, well-socialized, and came with all health records. Highly recommend!"
    },
    {
      id: 2,
      author: "Mike D.",
      rating: 5,
      date: "1 month ago",
      text: "Professional breeder with excellent facilities. The puppy training they provide is exceptional."
    }
  ];

  const handleStepClick = (stepId: string) => {
    switch (stepId) {
      case 'basic_info':
      case 'profile_photo':
        setIsEditDialogOpen(true);
        break;
      case 'verification':
        window.location.href = '/verification';
        break;
      default:
        setIsEditDialogOpen(true);
    }
  };

  return (
    <ProfileErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Mobile Header */}
        <MobileProfileHeader 
          profile={displayProfile}
          isOwnProfile={isOwnProfile}
          onEdit={() => setIsEditDialogOpen(true)}
        />

        <div className="p-4">
          {/* Desktop Header */}
          {!isMobile && (
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-medium text-black">
                @{displayProfile.username}
              </h1>
              {isOwnProfile && user && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Settings size={20} />
                </Button>
              )}
            </div>
          )}

          {/* Profile Completion Guide */}
          {isOwnProfile && showCompletionGuide && (
            <div className="mb-6">
              <ProfileCompletionGuide
                profile={displayProfile}
                onStepClick={handleStepClick}
                onDismiss={() => setShowCompletionGuide(false)}
              />
            </div>
          )}

          <ProfileHeader profile={displayProfile} />
          
          <ProfileBadges 
            verificationBadges={displayProfile.verification_badges.map(b => b.type)}
            specializations={displayProfile.specializations}
          />

          <ProfileActions />

          <ProfileHighlights highlights={highlights} />

          <ProfileTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            posts={posts}
            reviews={reviews}
            analyticsComponent={
              isOwnProfile ? <ProfileAnalyticsEnhanced profile={displayProfile} /> : undefined
            }
          />
        </div>

        {/* Edit Dialog */}
        {isEditDialogOpen && profile && (
          <ProfileEditDialog 
            profile={profile}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
          />
        )}
      </div>
    </ProfileErrorBoundary>
  );
};

export default Profile;
