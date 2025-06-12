
import React, { useState } from 'react';
import { Settings, Star, Crown, Zap, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const isGuestUser = !user;

  console.log('ProfileContent render:', {
    displayProfile: !!displayProfile,
    isOwnProfile,
    isMobile,
    hasUser: !!user,
    hasProfile: !!profile,
    isGuestUser
  });

  const handleStepClick = (stepId: string) => {
    // Only allow step clicks if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }

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
    : displayProfile.verification_badges?.map(badge => badge.type) || [];

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
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "2 weeks ago",
      text: "Amazing experience! Our Golden Retriever puppy is healthy, well-socialized, and came with all health records. The breeding program is exceptional and Sarah was so helpful throughout the entire process. Highly recommend Golden Paws Kennel!",
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      author: "Mike D.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "1 month ago",
      text: "Professional breeder with excellent facilities. The puppy training they provide is exceptional. Our lab is now 6 months old and perfectly trained!",
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      author: "Emma W.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4,
      date: "2 months ago",
      text: "Great experience overall. The facilities are clean and the dogs are well cared for. Would definitely recommend!",
      helpful: 5,
      verified: true
    }
  ];

  console.log('ProfileContent: About to render components');

  // Create a profile object for ProfileActions that matches the expected interface
  const profileForActions = displayProfile.full_name ? {
    id: displayProfile.id,
    full_name: displayProfile.full_name,
    email: displayProfile.email,
    phone: displayProfile.phone
  } : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Instagram style */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3">
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
            {isOwnProfile && user && (
              <Button 
                variant="ghost"
                size="sm"
                className="text-royal-blue hover:bg-royal-blue/10"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Guest Welcome Card */}
        {isGuestUser && (
          <div className="mx-4 mt-4 mb-6">
            <Card className="bg-gradient-to-br from-royal-blue/5 via-soft-sky/10 to-white border-royal-blue/20 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-royal-blue to-primary rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Welcome to MY PUP!</h3>
                    <p className="text-sm text-muted-foreground">Connect with verified breeders</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full bg-gradient-to-r from-royal-blue to-primary hover:from-royal-blue/90 hover:to-primary/90 text-white h-9"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join MY PUP
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Completion Guide */}
        {isOwnProfile && user && showCompletionGuide && (
          <div className="mx-4 mt-4 mb-6">
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

        {/* Premium Features Card - Instagram story style */}
        {isOwnProfile && user && (
          <div className="mx-4 mb-6">
            <Card className="bg-gradient-to-r from-royal-blue/5 to-primary/5 border-royal-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-royal-blue" />
                    <span className="font-semibold text-foreground">Premium Features</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-royal-blue to-primary text-white h-8 px-3 text-xs"
                    onClick={() => navigate('/monetization')}
                  >
                    Explore
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlock professional tools and priority placement
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Profile Section - Instagram style */}
        <div className="px-4 pb-6">
          <div className="bg-background">
            <ProfileHeaderWithPresence profile={displayProfile} />
          </div>
          
          {/* Badges Section */}
          <div className="mt-4">
            <ProfileBadges 
              verificationBadges={allVerificationBadges}
              specializations={displayProfile.specializations}
              certifications={displayProfile.certifications}
            />
          </div>

          {/* Actions Section */}
          <div className="mt-4">
            <ProfileActions 
              profile={profileForActions}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Online Users Section */}
          {user && (
            <div className="mt-6">
              <OnlineUsersList variant="compact" maxVisible={3} />
            </div>
          )}

          {/* Highlights Section - Instagram style */}
          <div className="mt-6">
            <ProfileHighlights 
              highlights={highlights} 
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Tabs Section - Instagram style */}
          <div className="mt-6 -mx-4">
            <div className="bg-background border-t border-border/40">
              <ProfileTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                posts={posts}
                reviews={reviews}
                analyticsComponent={
                  isOwnProfile && user ? <ProfileAnalyticsEnhanced profile={displayProfile} /> : undefined
                }
                isOwnProfile={isOwnProfile}
                userType={displayProfile.user_type}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && profile && user && (
        <ProfileEditDialog 
          profile={profile}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileContent;
