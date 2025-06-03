
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeaderWithPresence from '@/components/profile/ProfileHeaderWithPresence';
import ProfileBadges from '@/components/profile/ProfileBadges';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';
import ProfileCompletionGuideEnhanced from '@/components/profile/ProfileCompletionGuideEnhanced';
import MobileProfileHeader from '@/components/profile/MobileProfileHeader';
import ProfileAnalyticsEnhanced from '@/components/profile/ProfileAnalyticsEnhanced';
import OnlineUsersList from '@/components/ui/online-users-list';
import { UserProfile } from '@/types/profile';

interface ProfileContentProps {
  displayProfile: UserProfile;
  isOwnProfile: boolean;
  isMobile: boolean;
  user: any;
  profile: any;
  verificationBadges: any[];
}

const ProfileContent = ({ 
  displayProfile, 
  isOwnProfile, 
  isMobile, 
  user, 
  profile,
  verificationBadges 
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCompletionGuide, setShowCompletionGuide] = useState(true);

  console.log('ProfileContent render:', {
    displayProfile: !!displayProfile,
    isOwnProfile,
    isMobile,
    hasUser: !!user,
    hasProfile: !!profile
  });

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

  // Add verification badges from enhanced system
  const allVerificationBadges = verificationBadges.length > 0 
    ? verificationBadges.map(badge => badge.badge_name)
    : displayProfile.verification_badges.map(badge => badge.type);

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

  console.log('ProfileContent: About to render components');

  return (
    <>
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
            <ProfileCompletionGuideEnhanced
              profile={{
                full_name: displayProfile.full_name,
                username: displayProfile.username,
                bio: displayProfile.bio,
                location: displayProfile.location,
                phone: displayProfile.phone,
                website_url: displayProfile.website_url,
                avatar_url: displayProfile.avatar_url,
                verified: displayProfile.verified,
                trust_score: displayProfile.trust_score,
                profile_completion_percentage: 85,
                specializations: displayProfile.specializations
              }}
              onStepClick={handleStepClick}
              onDismiss={() => setShowCompletionGuide(false)}
            />
          </div>
        )}

        <ProfileHeaderWithPresence profile={displayProfile} />
        
        <ProfileBadges 
          verificationBadges={allVerificationBadges}
          specializations={displayProfile.specializations}
          certifications={displayProfile.certifications}
        />

        <ProfileActions />

        {/* Online Users Section */}
        <div className="mb-6">
          <OnlineUsersList variant="compact" maxVisible={3} />
        </div>

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
    </>
  );
};

export default ProfileContent;
