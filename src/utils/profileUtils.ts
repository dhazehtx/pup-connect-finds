
import { UserProfile } from '@/types/profile';

interface CreateDisplayProfileParams {
  enhancedProfile: any;
  profile: any;
  user: any;
  isOwnProfile: boolean;
  userId?: string;
  portfolios: any[];
  followers: any[];
  following: any[];
  verificationBadges: any[];
}

export const createDisplayProfile = ({
  enhancedProfile,
  profile,
  user,
  isOwnProfile,
  userId,
  portfolios,
  followers,
  following,
  verificationBadges
}: CreateDisplayProfileParams): UserProfile => {
  console.log('createDisplayProfile called with:', {
    hasEnhancedProfile: !!enhancedProfile,
    hasProfile: !!profile,
    hasUser: !!user,
    isOwnProfile,
    userId
  });

  // Use enhanced profile data if available
  if (enhancedProfile) {
    console.log('Using enhanced profile data');
    return {
      ...enhancedProfile,
      verification_badges: enhancedProfile.verified ? [
        { type: 'ID Verified', verified_at: new Date().toISOString() }
      ] : [],
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
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0
      }
    };
  }

  // Use existing profile for own profile
  if (isOwnProfile && profile) {
    console.log('Using existing profile for own profile');
    return {
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
      trust_score: (profile.rating / 5) || 0,
      breeding_program_name: portfolios.length > 0 ? portfolios[0].portfolio_name : undefined,
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
        followers: followers.length,
        following: following.length,
        posts: 0,
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0
      },
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: profile.updated_at || new Date().toISOString()
    };
  }

  // Default demo profile
  console.log('Using default demo profile');
  return {
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
    trust_score: 0.95,
    breeding_program_name: 'Golden Paws Breeding Program',
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
};
