
// Comprehensive TypeScript interfaces for profile data structures

export interface ContactInfo {
  phone?: string;
  email: string;
  website?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface PrivacySettings {
  show_bio: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_social_links: boolean;
}

export interface VerificationBadge {
  type: 'ID Verified' | 'Licensed Breeder' | 'Vet Reviewed' | 'Business Verified';
  verified_at: string;
  expires_at?: string;
}

export interface ProfileStats {
  followers: number;
  following: number;
  posts: number;
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
}

export interface ProfileAnalytics {
  profile_views: number;
  contact_clicks: number;
  listing_views: number;
  inquiry_rate: number;
  response_rate: number;
  average_response_time: number; // in minutes
}

export interface UserProfile {
  // Basic Info
  id: string;
  username?: string;
  full_name?: string;
  email: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  
  // User Type & Verification
  user_type: 'buyer' | 'breeder' | 'shelter' | 'admin';
  verified: boolean;
  verification_badges: VerificationBadge[];
  
  // Professional Info
  years_experience: number;
  rating: number;
  total_reviews: number;
  specializations: string[];
  certifications: string[];
  
  // Contact & Social
  phone?: string;
  website_url?: string;
  social_links: SocialLinks;
  privacy_settings: PrivacySettings;
  
  // Stats & Analytics
  stats: ProfileStats;
  analytics?: ProfileAnalytics;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ProfileExportData {
  profile: UserProfile;
  listings: any[];
  reviews: any[];
  favorites: any[];
  export_date: string;
  export_format: 'json' | 'pdf' | 'csv';
}

export interface ProfileShareData {
  profile_id: string;
  share_token: string;
  shared_by: string;
  shared_at: string;
  expires_at?: string;
  view_count: number;
  is_public: boolean;
}

export interface ProfileComparison {
  profiles: UserProfile[];
  comparison_fields: (keyof UserProfile)[];
  created_at: string;
  comparison_id: string;
}
