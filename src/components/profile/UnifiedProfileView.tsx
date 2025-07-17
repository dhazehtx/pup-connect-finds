import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';
import ProfileHeaderWithPresence from './ProfileHeaderWithPresence';
import ProfileActionButtons from './ProfileActionButtons';
import ProfilePostsGrid from './ProfilePostsGrid';
import { UserProfile } from '@/types/profile';

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const profileUserId = userId || user?.id;

  useEffect(() => {
    if (profileUserId) {
      fetchProfile();
      fetchPosts();
    }
  }, [profileUserId, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          bio,
          avatar_url,
          location,
          verified,
          user_type,
          rating,
          total_reviews,
          years_experience,
          email,
          created_at,
          updated_at
        `)
        .eq('id', profileUserId)
        .single();

      if (error) throw error;
      
      // Create a properly typed profile object with default values
      const typedProfile: UserProfile = {
        id: data.id,
        username: data.username || '',
        full_name: data.full_name || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        avatar_url: data.avatar_url || '',
        user_type: data.user_type || 'buyer',
        verified: data.verified || false,
        rating: data.rating || 0,
        total_reviews: data.total_reviews || 0,
        years_experience: data.years_experience || 0,
        verification_badges: [],
        specializations: [],
        certifications: [],
        social_links: {},
        privacy_settings: {
          show_bio: true,
          show_email: false,
          show_phone: false,
          show_location: true,
          show_social_links: true
        },
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          totalInquiries: 0
        },
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      setProfile(typedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!profileUserId) return;
    navigate(`/messages?contact=${profileUserId}`);
  };

  const handleFollow = async () => {
    // For now, just toggle the follow state locally since follows table doesn't exist
    setIsFollowing(!isFollowing);
    toast({ 
      title: isFollowing ? "Unfollowed successfully" : "Following successfully" 
    });
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || profile?.username}'s Profile`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Profile link copied to clipboard!" });
    }
  };

  const handleViewPublicProfile = () => {
    navigate(`/profile/${profileUserId}`);
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="Profile not found"
        message="The profile you're looking for doesn't exist or couldn't be loaded."
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <ProfileHeaderWithPresence profile={profile} />
        
        {/* Action Buttons */}
        <ProfileActionButtons
          isCurrentUser={isCurrentUser}
          isPublicView={false}
          isFollowing={isFollowing}
          onEditProfile={handleEditProfile}
          onSettings={handleSettings}
          onShare={handleShare}
          onViewPublicProfile={handleViewPublicProfile}
          onMessage={handleMessage}
          onFollow={handleFollow}
        />
      </div>

      {/* Posts Grid */}
      <ProfilePostsGrid userId={profileUserId || ''} />
    </div>
  );
};

export default UnifiedProfileView;
