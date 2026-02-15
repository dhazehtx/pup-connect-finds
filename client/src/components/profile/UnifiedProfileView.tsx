
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Globe, Calendar, UserPlus, UserCheck, Shield, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from './ProfileSettings';
import ProfileSettingsModal from './ProfileSettingsModal';
import ProfilePostsGrid from './ProfilePostsGrid';
import FollowersModal from './FollowersModal';
import BugReportButton from '@/components/bugs/BugReportButton';
import LoadingState from '@/components/ui/loading-state';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { usePosts } from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  location: string;
  website_url: string;
  avatar_url: string;
  user_type: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  years_experience: number;
  created_at: string;
}

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const profileId = userId || user?.id;
  const { followers, following, isFollowing, followUser, unfollowUser } = useFollowSystem(profileId);
  const { postCount } = usePosts(profileId);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  // Force refetch on route changes to ensure fresh data
  useEffect(() => {
    if (profileId) {
      const timeoutId = setTimeout(() => {
        fetchProfile();
      }, 100); // Small delay to ensure component is mounted
      
      return () => clearTimeout(timeoutId);
    }
  }, [window.location.pathname]);

  const fetchProfile = async () => {
    try {
      if (!profileId) {
        setLoading(false);
        return;
      }

      // Force fresh data with cache busting
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      
      // Type-safe profile transformation
      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        location: data.location || '',
        website_url: data.website_url || '',
        avatar_url: data.avatar_url || '',
        user_type: data.user_type || 'buyer',
        verified: data.verified || false,
        rating: data.rating || 0,
        total_reviews: data.total_reviews || 0,
        years_experience: data.years_experience || 0,
        created_at: data.created_at || new Date().toISOString()
      };
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileId) return;
    
    if (isFollowing) {
      await unfollowUser(profileId);
    } else {
      await followUser(profileId);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to send messages", variant: "destructive" });
      navigate('/greeting');
      return;
    }
    if (!profileId || profileId === user.id) return;

    setMessagingLoading(true);
    try {
      const conv = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: profileId }
      });
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast({ title: "Error", description: "Could not start conversation", variant: "destructive" });
    } finally {
      setMessagingLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  if (showSettings && isCurrentUser) {
    return (
      <ProfileSettings 
        profile={profile} 
        onBack={() => setShowSettings(false)}
        onUpdate={fetchProfile}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Profile Header */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between mb-2 gap-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <h1 className="text-xl sm:text-2xl font-bold">{profile.full_name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      <Shield className="w-3 h-3" />
                      Official
                    </div>
                  )}
                </div>
                
                {/* Settings Icon for current user */}
                {isCurrentUser && (
                  <ProfileSettingsModal onEditProfile={() => setShowSettings(true)} />
                )}
              </div>
              
              {profile.username && (
                <p className="text-sm sm:text-base text-gray-600 mb-2">@{profile.username}</p>
              )}

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 text-center mb-3 sm:mb-4">
                <div>
                  <div className="font-bold">{postCount}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setShowFollowersModal(true)}
                >
                  <div className="font-bold">{followers.length}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setShowFollowingModal(true)}
                >
                  <div className="font-bold">{following.length}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isCurrentUser && (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      disabled={messagingLoading}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {messagingLoading ? 'Opening...' : 'Message'}
                    </Button>
                  </>
                )}
                {isCurrentUser && (
                  <>
                    <BugReportButton variant="outline" size="sm" className="bg-white text-blue-600 border-blue-300 hover:bg-slate-50" iconClassName="text-blue-600" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/privacy-settings')}
                      className="gap-2 bg-white text-blue-600 border-blue-300 hover:bg-slate-50"
                    >
                      <Shield className="w-4 h-4 text-blue-600" />
                      Privacy
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Posts */}
      <div className="mt-6">
        <ProfilePostsGrid userId={profileId!} />
      </div>

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        type="followers"
        users={followers.map(f => ({
          id: f.follower_id,
          full_name: f.follower_profile?.full_name || 'User',
          username: f.follower_profile?.username || 'user',
          avatar_url: f.follower_profile?.avatar_url || undefined,
          verified: false,
          user_type: 'buyer',
        }))}
        currentUserId={user?.id}
      />

      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        type="following"
        users={following.map(f => ({
          id: f.following_id,
          full_name: f.following_profile?.full_name || 'User',
          username: f.following_profile?.username || 'user',
          avatar_url: f.following_profile?.avatar_url || undefined,
          verified: false,
          user_type: 'buyer',
        }))}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default UnifiedProfileView;
