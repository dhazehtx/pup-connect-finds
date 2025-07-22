
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
import ProfileAuthScreen from '@/components/profile/ProfileAuthScreen';
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
  const isGuestUser = !user && !loading;
  
  console.log('ProfileContainer render:', {
    loading,
    enhancedLoading,
    user: !!user,
    profile: !!profile,
    enhancedProfile: !!enhancedProfile,
    isOwnProfile,
    isGuestUser,
    userId,
    currentUserId: user?.id
  });

  // Show auth screen for guest users trying to access their own profile
  if (isGuestUser && isOwnProfile && !userId) {
    console.log('ProfileContainer: Showing auth screen for guest user accessing own profile');
    return <ProfileAuthScreen />;
  }
  
  // Show optimized loading state while fetching user data (only if user is logged in)
  if (user && (loading || enhancedLoading)) {
    console.log('ProfileContainer: Showing loading spinner for authenticated user');
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
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
  // For guest users or viewing specific profiles, show enhanced demo profile
  // For logged in users viewing their own profile, use their actual data
  let displayProfile;
  
  try {
    displayProfile = createDisplayProfile({
      enhancedProfile: isGuestUser || (userId && userId !== user?.id) ? enhancedProfile : (isOwnProfile && user ? null : enhancedProfile),
      profile: (user && isOwnProfile && !userId) ? profile : null,
      user: (user && isOwnProfile && !userId) ? user : null,
      isOwnProfile: user ? isOwnProfile : false,
      userId,
      portfolios: isGuestUser || (userId && userId !== user?.id) ? portfolios : (isOwnProfile && user ? [] : portfolios),
      followers: isGuestUser || (userId && userId !== user?.id) ? followers : (isOwnProfile && user ? [] : followers),
      following: isGuestUser || (userId && userId !== user?.id) ? following : (isOwnProfile && user ? [] : following),
      verificationBadges: isGuestUser || (userId && userId !== user?.id) ? verificationBadges : (isOwnProfile && user ? [] : verificationBadges)
    });
  } catch (error) {
    console.error('Error creating display profile:', error);
    // Fallback for guest users - create a simple demo profile
    if (isGuestUser) {
      displayProfile = {
        id: 'guest-demo',
        full_name: 'Golden Paws Kennel',
        username: 'goldenpaws',
        email: 'contact@goldenpaws.com',
        bio: 'Specializing in Golden Retrievers and Labradors for over 15 years. Join MY PUP to see more!',
        location: 'San Francisco, CA',
        avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
        user_type: 'breeder',
        verified: true,
        trust_score: 0.95,
        verification_level: 3,
        profile_completion_percentage: 85,
        breeding_program_name: 'Golden Paws Breeding Program',
        specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
        certifications: ['AKC Registered Breeder', 'USDA Licensed'],
        verification_badges: [
          { type: 'identity', name: 'ID Verified' },
          { type: 'breeder_license', name: 'Licensed Breeder' }
        ],
        years_experience: 15,
        rating: 4.9,
        total_reviews: 156,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  console.log('ProfileContainer: Created displayProfile:', displayProfile);

  // Error boundary to catch any remaining issues
  if (!displayProfile) {
    console.error('ProfileContainer: Failed to create display profile');
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Unable to load profile</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <ProfileContent 
          displayProfile={displayProfile}
          isOwnProfile={user ? isOwnProfile : false}
          isMobile={isMobile}
          user={user}
          profile={profile}
          verificationBadges={isGuestUser || (userId && userId !== user?.id) ? verificationBadges : (isOwnProfile && user ? [] : verificationBadges)}
        />
      </div>
    </ProfileErrorBoundary>
  );
};

export default ProfileContainer;
