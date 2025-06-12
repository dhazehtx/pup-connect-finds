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
    <div className="min-h-screen bg-gradient-to-b from-royal-blue/5 via-soft-sky/10 to-background">
      {/* Mobile Header */}
      <MobileProfileHeader 
        profile={displayProfile}
        isOwnProfile={isOwnProfile}
        onEdit={() => user ? setIsEditDialogOpen(true) : navigate('/auth')}
      />

      <div className="p-4 space-y-6">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-royal-blue to-primary rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-royal-blue to-primary bg-clip-text text-transparent">
                @{displayProfile.username}
              </h1>
            </div>
            {isOwnProfile && user && (
              <Button 
                variant="outline"
                size="sm"
                className="border-royal-blue/20 hover:bg-royal-blue/5 hover:border-royal-blue/40 transition-all duration-200"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings size={20} className="text-royal-blue" />
              </Button>
            )}
          </div>
        )}

        {/* Guest Welcome Card - Enhanced with royal blue theme */}
        {isGuestUser && (
          <Card className="mb-6 bg-gradient-to-br from-royal-blue/10 via-soft-sky/20 to-white border-royal-blue/20 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="w-10 h-10 bg-gradient-to-br from-royal-blue to-primary rounded-xl flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-royal-blue to-primary bg-clip-text text-transparent">
                  Welcome to MY PUP!
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                You're viewing a sample breeder profile. Create your MY PUP account to connect with verified breeders and find your perfect puppy!
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-royal-blue/20 to-royal-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Crown className="w-6 h-6 text-royal-blue" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Verified Breeders</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Safe Messaging</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-green/40 to-mint-green/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Reviews & Ratings</div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full bg-gradient-to-r from-royal-blue to-primary hover:from-royal-blue/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Join MY PUP - It's Free!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Guide - Enhanced styling */}
        {isOwnProfile && user && showCompletionGuide && (
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

        {/* Premium Features Card - Enhanced with royal blue theme */}
        {isOwnProfile && user && (
          <Card className="mb-6 bg-gradient-to-br from-royal-blue/5 via-primary/5 to-white border-royal-blue/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-royal-blue to-primary bg-clip-text text-transparent">
                  Premium Features
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Unlock professional tools to help more families find their perfect puppy
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-royal-blue/20 to-royal-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Crown className="w-6 h-6 text-royal-blue" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Priority Placement</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Advanced Analytics</div>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-green/40 to-mint-green/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-xs font-medium text-foreground">Verification Badge</div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/monetization')} 
                className="w-full bg-gradient-to-r from-royal-blue to-primary hover:from-royal-blue/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Explore Premium Features
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Profile Header with modern styling */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-royal-blue/10 shadow-lg">
          <ProfileHeaderWithPresence profile={displayProfile} />
        </div>
        
        {/* Enhanced Badges Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-royal-blue/10 shadow-lg">
          <ProfileBadges 
            verificationBadges={allVerificationBadges}
            specializations={displayProfile.specializations}
            certifications={displayProfile.certifications}
          />
        </div>

        {/* Enhanced Actions Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-royal-blue/10 shadow-lg">
          <ProfileActions 
            profile={profileForActions}
            isOwnProfile={isOwnProfile}
          />
        </div>

        {/* Online Users Section - Enhanced styling */}
        {user && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-royal-blue/10 shadow-lg">
            <OnlineUsersList variant="compact" maxVisible={3} />
          </div>
        )}

        {/* Enhanced Highlights Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-royal-blue/10 shadow-lg">
          <ProfileHighlights 
            highlights={highlights} 
            isOwnProfile={isOwnProfile}
          />
        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-royal-blue/10 shadow-lg overflow-hidden">
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

      {/* Edit Dialog - Only show if user is logged in */}
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
