
import React from 'react';
import SimpleProfileContent from './SimpleProfileContent';

const SimpleProfileContainer = () => {
  // Default profile data for demonstration
  const sampleProfile = {
    id: 'sample-user',
    full_name: 'John Doe',
    username: 'johndoe',
    bio: 'Dog lover and professional breeder with 10+ years of experience.',
    location: 'Los Angeles, CA',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    user_type: 'breeder' as const,
    verified: true,
    years_experience: 10,
    rating: 4.8,
    total_reviews: 156,
    created_at: '2020-01-01T00:00:00Z',
    professional_status: 'verified_professional' as const,
    specializations: ['Golden Retriever', 'Labrador', 'German Shepherd'],
    certifications: ['AKC Certified', 'Dog Training Certificate']
  };

  const sampleVerificationBadges = [
    {
      badge_type: 'id_verified',
      badge_name: 'ID Verified',
      is_active: true
    },
    {
      badge_type: 'business_license',
      badge_name: 'Business License',
      is_active: true
    }
  ];

  return (
    <SimpleProfileContent 
      profile={sampleProfile}
      verificationBadges={sampleVerificationBadges}
      isOwnProfile={false}
      subscriptionTier="pro"
    />
  );
};

export default SimpleProfileContainer;
