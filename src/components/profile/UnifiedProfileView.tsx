
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Globe, Calendar, UserPlus, UserCheck } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import ProfileSettingsModal from './ProfileSettingsModal';
import ProfilePostsGrid from './ProfilePostsGrid';
import LoadingState from '@/components/ui/loading-state';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { usePosts } from '@/hooks/usePosts';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const profileId = userId || user?.id;
  const { followers, following, isFollowing, followUser, unfollowUser } = useFollowSystem(profileId);
  const { postCount } = usePosts(profileId);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setProfile(data);
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
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
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
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                  {profile.verified && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                
                {/* Settings Icon for current user */}
                {isCurrentUser && (
                  <ProfileSettingsModal onEditProfile={() => setShowSettings(true)} />
                )}
              </div>
              
              {profile.username && (
                <p className="text-gray-600 mb-2">@{profile.username}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-center mb-4">
                <div>
                  <div className="font-bold">{postCount}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div>
                  <div className="font-bold">{followers.length}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="font-bold">{following.length}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isCurrentUser && (
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
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <ProfilePostsGrid userId={profileId!} />
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">User Type</h3>
                <p className="text-gray-600 capitalize">{profile.user_type}</p>
              </div>
              
              {profile.years_experience > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900">Experience</h3>
                  <p className="text-gray-600">{profile.years_experience} years</p>
                </div>
              )}
              
              {profile.total_reviews > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900">Reviews</h3>
                  <p className="text-gray-600">
                    {profile.rating.toFixed(1)} ★ ({profile.total_reviews} reviews)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedProfileView;
