
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
      if (!isCurrentUser && user) {
        checkFollowStatus();
      }
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
          breeding_program_name,
          trust_score,
          stats
        `)
        .eq('id', profileUserId)
        .single();

      if (error) throw error;
      setProfile(data);
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

  const checkFollowStatus = async () => {
    if (!user || !profileUserId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error: any) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleMessage = () => {
    if (!profileUserId) return;
    navigate(`/messages?contact=${profileUserId}`);
  };

  const handleFollow = async () => {
    if (!user || !profileUserId) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "Unfollowed successfully" });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({ title: "Following successfully" });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
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
      <ProfilePostsGrid posts={posts} />
    </div>
  );
};

export default UnifiedProfileView;
