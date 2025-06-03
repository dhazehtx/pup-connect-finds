
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  user_type: 'buyer' | 'breeder' | 'shelter' | 'admin';
  verified: boolean;
  trust_score: number;
  verification_level: number;
  profile_completion_percentage: number;
  breeding_program_name?: string;
  specializations: string[];
  certifications: string[];
  breeding_since?: string;
  business_license_number?: string;
  veterinary_license?: string;
  website_url?: string;
  instagram_handle?: string;
  facebook_page?: string;
  years_experience: number;
  rating: number;
  total_reviews: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

interface VerificationBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  issued_at: string;
  expires_at?: string;
  is_active: boolean;
  verification_data: any;
}

interface PrivacySettings {
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_social_media: boolean;
  show_breeding_history: boolean;
  show_achievements: boolean;
  allow_messages_from: 'everyone' | 'verified_users' | 'followers_only';
  allow_profile_views: 'everyone' | 'registered_users' | 'followers_only';
  show_online_status: boolean;
}

export const useEnhancedProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);

  // Fetch enhanced profile data
  const fetchEnhancedProfile = useCallback(async (userId?: string) => {
    if (!userId && !user) return;
    
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Fetch verification badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('verification_badges')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true);

      if (badgesError) console.error('Error fetching badges:', badgesError);
      else setVerificationBadges(badgesData || []);

      // Fetch privacy settings (only for own profile)
      if (targetUserId === user?.id) {
        const { data: privacyData, error: privacyError } = await supabase
          .from('privacy_settings')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (privacyError && privacyError.code !== 'PGRST116') {
          console.error('Error fetching privacy settings:', privacyError);
        } else {
          setPrivacySettings(privacyData);
        }
      }

    } catch (error) {
      console.error('Error fetching enhanced profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update enhanced profile
  const updateEnhancedProfile = useCallback(async (updates: Partial<EnhancedProfile>) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setPrivacySettings(data);
      toast({
        title: "Success",
        description: "Privacy settings updated",
      });

      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  // Calculate trust metrics
  const calculateTrustMetrics = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_trust_score', {
        user_uuid: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating trust metrics:', error);
      return 0;
    }
  }, []);

  // Update profile completion
  const updateProfileCompletion = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('update_profile_completion', {
        user_uuid: user.id
      });

      if (error) throw error;
      
      // Refresh profile to get updated completion percentage
      await fetchEnhancedProfile();
      
      return data;
    } catch (error) {
      console.error('Error updating profile completion:', error);
      return 0;
    }
  }, [user, fetchEnhancedProfile]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchEnhancedProfile();
    }
  }, [user, fetchEnhancedProfile]);

  return {
    profile,
    verificationBadges,
    privacySettings,
    loading,
    fetchEnhancedProfile,
    updateEnhancedProfile,
    updatePrivacySettings,
    calculateTrustMetrics,
    updateProfileCompletion
  };
};
