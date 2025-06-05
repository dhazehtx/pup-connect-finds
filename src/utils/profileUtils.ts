
import { UserProfile } from '@/types/profile';

interface CreateDisplayProfileParams {
  enhancedProfile: any;
  profile: any;
  user: any;
  isOwnProfile: boolean;
  userId?: string;
  portfolios?: any[];
  followers?: any[];
  following?: any[];
  verificationBadges?: any[];
}

export const createDisplayProfile = ({
  enhancedProfile,
  profile,
  user,
  isOwnProfile,
  userId,
  portfolios = [],
  followers = [],
  following = [],
  verificationBadges = []
}: CreateDisplayProfileParams): UserProfile => {
  console.log('createDisplayProfile called with:', {
    hasEnhancedProfile: !!enhancedProfile,
    hasProfile: !!profile,
    hasUser: !!user,
    isOwnProfile,
    userId: { _type: typeof userId, value: userId }
  });

  // For own profile without specific userId, prefer actual user data over mock data
  if (isOwnProfile && !userId && profile && user) {
    console.log('Using actual user profile data');
    return {
      id: user.id,
      full_name: profile.full_name || user.email?.split('@')[0] || 'User',
      username: profile.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      bio: profile.bio || '',
      location: profile.location || '',
      phone: profile.phone || '',
      avatar_url: profile.avatar_url || '',
      website_url: profile.website_url || '',
      user_type: profile.user_type || 'buyer',
      verified: profile.verified || false,
      trust_score: profile.trust_score || 0,
      verification_level: profile.verification_level || 0,
      profile_completion_percentage: profile.profile_completion_percentage || 0,
      breeding_program_name: profile.breeding_program_name || '',
      specializations: profile.specializations || [],
      certifications: profile.certifications || [],
      breeding_since: profile.breeding_since || '',
      years_experience: profile.years_experience || 0,
      rating: profile.rating || 0,
      total_reviews: profile.total_reviews || 0,
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: profile.updated_at || new Date().toISOString(),
      verification_badges: verificationBadges.length > 0 
        ? verificationBadges.map(badge => ({
            type: badge.badge_name || badge.type,
            verified_at: badge.issued_at || new Date().toISOString()
          }))
        : [],
      social_links: profile.social_links || {},
      privacy_settings: {
        show_bio: true,
        show_email: false,
        show_phone: false,
        show_location: true,
        show_social_links: true
      },
      stats: {
        followers: followers.length,
        following: following.length,
        posts: 0,
        totalListings: portfolios.length,
        activeListings: portfolios.filter(p => p.status === 'active').length,
        totalViews: 0,
        totalInquiries: 0
      }
    };
  }

  // Use enhanced profile data for other users or when enhanced profile exists
  if (enhancedProfile) {
    console.log('Using enhanced profile data');
    return {
      ...enhancedProfile,
      verification_badges: verificationBadges.length > 0 
        ? verificationBadges.map(badge => ({
            type: badge.badge_name || badge.type,
            verified_at: badge.issued_at || new Date().toISOString()
          }))
        : [{
            type: 'ID Verified',
            verified_at: new Date().toISOString()
          }],
      social_links: enhancedProfile.social_links || {},
      privacy_settings: {
        show_bio: true,
        show_email: false,
        show_phone: false,
        show_location: true,
        show_social_links: true
      },
      stats: {
        followers: followers.length,
        following: following.length,
        posts: 0,
        totalListings: portfolios.length,
        activeListings: portfolios.filter(p => p.status === 'active').length,
        totalViews: 0,
        totalInquiries: 0
      }
    };
  }

  // Fallback to basic profile/user data
  console.log('Using fallback profile data');
  const fallbackProfile = profile || user;
  if (!fallbackProfile) {
    throw new Error('No profile data available');
  }

  return {
    id: user?.id || fallbackProfile.id,
    full_name: fallbackProfile.full_name || user?.email?.split('@')[0] || 'User',
    username: fallbackProfile.username || user?.email?.split('@')[0] || 'user',
    email: user?.email || fallbackProfile.email || '',
    bio: fallbackProfile.bio || '',
    location: fallbackProfile.location || '',
    phone: fallbackProfile.phone || '',
    avatar_url: fallbackProfile.avatar_url || '',
    website_url: fallbackProfile.website_url || '',
    user_type: fallbackProfile.user_type || 'buyer',
    verified: fallbackProfile.verified || false,
    trust_score: fallbackProfile.trust_score || 0,
    verification_level: fallbackProfile.verification_level || 0,
    profile_completion_percentage: fallbackProfile.profile_completion_percentage || 0,
    breeding_program_name: fallbackProfile.breeding_program_name || '',
    specializations: fallbackProfile.specializations || [],
    certifications: fallbackProfile.certifications || [],
    breeding_since: fallbackProfile.breeding_since || '',
    years_experience: fallbackProfile.years_experience || 0,
    rating: fallbackProfile.rating || 0,
    total_reviews: fallbackProfile.total_reviews || 0,
    created_at: fallbackProfile.created_at || new Date().toISOString(),
    updated_at: fallbackProfile.updated_at || new Date().toISOString(),
    verification_badges: [],
    social_links: {},
    privacy_settings: {
      show_bio: true,
      show_email: false,
      show_phone: false,
      show_location: true,
      show_social_links: true
    },
    stats: {
      followers: followers.length,
      following: following.length,
      posts: 0,
      totalListings: portfolios.length,
      activeListings: portfolios.filter(p => p.status === 'active').length,
      totalViews: 0,
      totalInquiries: 0
    }
  };
};
