
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useEnhancedProfiles } from '@/hooks/useEnhancedProfiles';
import { useBreedingPortfolio } from '@/hooks/useBreedingPortfolio';
import { useProfessionalNetwork } from '@/hooks/useProfessionalNetwork';
import { useRealtimeVerification } from '@/hooks/useRealtimeVerification';
import OptimizedLoading from '@/components/ui/optimized-loading';
import ProfileErrorBoundary from '@/components/profile/ProfileErrorBoundary';
import ProfileContent from '@/components/profile/ProfileContent';
import { createDisplayProfile } from '@/utils/profileUtils';

const ProfileContainer = () => {
  const { userId } = useParams();
  const { user, profile, loading } = useAuth();
  const { isMobile } = useMobileOptimized();
  
  // Enhanced profile hooks - with error handling for guest users
  const { 
    profile: enhancedProfile, 
    verificationBadges, 
    loading: enhancedLoading 
  } = useEnhancedProfiles();
  
  const { portfolios = [] } = useBreedingPortfolio();
  const { followers = [], following = [] } = useProfessionalNetwork();
  
  // Initialize real-time verification notifications only if user is logged in
  // Wrap in try-catch to prevent errors for guest users
  try {
    if (user) {
      useRealtimeVerification();
    }
  } catch (error) {
    console.log('Real-time verification not available for guest users');
  }
  
  // Check if this is the current user's profile or another user's profile
  const isOwnProfile = !userId || (user && userId === user?.id);
  
  console.log('ProfileContainer render:', {
    loading,
    enhancedLoading,
    user: !!user,
    profile: !!profile,
    enhancedProfile: !!enhancedProfile,
    isOwnProfile,
    userId,
    currentUserId: user?.id
  });
  
  // Show optimized loading state while fetching user data (only if user is logged in)
  if (user && (loading || enhancedLoading)) {
    console.log('ProfileContainer: Showing loading spinner for authenticated user');
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <OptimizedLoading 
            size="lg" 
            text="Loading profile..." 
            variant="spinner"
            color="primary"
          />
        </div>
      </div>
    );
  }

  // Create display profile using utility function
  // For logged out users or viewing specific profiles, show enhanced demo profile
  // For logged in users viewing their own profile, use their actual data
  const displayProfile = createDisplayProfile({
    enhancedProfile: (!user || (userId && userId !== user?.id)) ? enhancedProfile : (isOwnProfile && user ? null : enhancedProfile),
    profile: (user && isOwnProfile && !userId) ? profile : null,
    user: (user && isOwnProfile && !userId) ? user : null,
    isOwnProfile: user ? isOwnProfile : false,
    userId,
    portfolios: (!user || (userId && userId !== user?.id)) ? portfolios : (isOwnProfile && user ? [] : portfolios),
    followers: (!user || (userId && userId !== user?.id)) ? followers : (isOwnProfile && user ? [] : followers),
    following: (!user || (userId && userId !== user?.id)) ? following : (isOwnProfile && user ? [] : following),
    verificationBadges: (!user || (userId && userId !== user?.id)) ? verificationBadges : (isOwnProfile && user ? [] : verificationBadges)
  });

  console.log('ProfileContainer: Created displayProfile:', displayProfile);

  // Error boundary to catch any remaining issues
  if (!displayProfile) {
    console.error('ProfileContainer: Failed to create display profile');
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to load profile</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <ProfileContent 
          displayProfile={displayProfile}
          isOwnProfile={user ? isOwnProfile : false}
          isMobile={isMobile}
          user={user}
          profile={profile}
          verificationBadges={(!user || (userId && userId !== user?.id)) ? verificationBadges : (isOwnProfile && user ? [] : verificationBadges)}
        />
      </div>
    </ProfileErrorBoundary>
  );
};

export default ProfileContainer;
