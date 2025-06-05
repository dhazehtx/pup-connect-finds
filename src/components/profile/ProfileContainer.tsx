
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
  
  // Enhanced profile hooks
  const { 
    profile: enhancedProfile, 
    verificationBadges, 
    loading: enhancedLoading 
  } = useEnhancedProfiles();
  
  const { portfolios } = useBreedingPortfolio();
  const { followers, following } = useProfessionalNetwork();
  
  // Initialize real-time verification notifications
  useRealtimeVerification();
  
  // Check if this is the current user's profile or another user's profile
  const isOwnProfile = !userId || userId === user?.id;
  
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
  
  // Show optimized loading state while fetching user data
  if (loading || enhancedLoading) {
    console.log('ProfileContainer: Showing loading spinner');
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
  // For own profile without userId param, use actual user data instead of mock data
  const displayProfile = createDisplayProfile({
    enhancedProfile: isOwnProfile && !userId ? null : enhancedProfile, // Don't use mock data for own profile
    profile,
    user,
    isOwnProfile,
    userId,
    portfolios,
    followers,
    following,
    verificationBadges: isOwnProfile && !userId ? [] : verificationBadges // Don't use mock badges for own profile
  });

  console.log('ProfileContainer: Created displayProfile:', displayProfile);

  return (
    <ProfileErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <ProfileContent 
          displayProfile={displayProfile}
          isOwnProfile={isOwnProfile}
          isMobile={isMobile}
          user={user}
          profile={profile}
          verificationBadges={isOwnProfile && !userId ? [] : verificationBadges}
        />
      </div>
    </ProfileErrorBoundary>
  );
};

export default ProfileContainer;
