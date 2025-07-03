import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingState from '@/components/ui/loading-state';
import ProfileTabs from './ProfileTabs';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Star, 
  Shield, 
  Users, 
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

interface ProfileData {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  userType: 'buyer' | 'breeder' | 'shelter' | 'admin';
  bio: string | null;
  location: string | null;
  phone: string | null;
  websiteUrl: string | null;
  avatarUrl: string | null;
  verified: boolean;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  createdAt: string;
  updatedAt: string;
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const { user, loading: authLoading } = useAuth();
  const { getUserListings } = useDogListings();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadProfile();
      loadUserListings();
    }
  }, [targetUserId]);

  const loadProfile = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const profileData = await userService.getProfile(targetUserId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserListings = async () => {
    if (!targetUserId) return;

    try {
      const listings = await getUserListings(targetUserId);
      setUserListings(listings);
    } catch (error) {
      console.error('Error loading user listings:', error);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Mock posts data for photo grid
  const mockPosts = userListings
    .filter(listing => listing.image_url)
    .map(listing => listing.image_url);

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'breeder': return 'bg-blue-100 text-blue-800';
      case 'shelter': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'breeder': return 'Professional Breeder';
      case 'shelter': return 'Animal Shelter';
      case 'admin': return 'Admin';
      default: return 'Dog Lover';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.fullName || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">
                      {profile.fullName || profile.username || 'Anonymous User'}
                    </h1>
                    {profile.verified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <Badge className={getUserTypeColor(profile.userType)}>
                    {getUserTypeLabel(profile.userType)}
                  </Badge>

                  {profile.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-medium">{profile.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">
                        ({profile.totalReviews} review{profile.totalReviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isCurrentUser ? (
                    <Link to="/profile/edit">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-600 mt-4 leading-relaxed">{profile.bio}</p>
              )}

              {/* Profile Details */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>

                {profile.yearsExperience > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {profile.yearsExperience} years experience
                  </div>
                )}
              </div>

              {/* Contact Info */}
              {(profile.phone || profile.websiteUrl) && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a 
                      href={profile.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userListings.length}</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.totalReviews}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Followers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.yearsExperience}</div>
            <div className="text-sm text-gray-600">Years Exp.</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        posts={mockPosts}
        reviews={[]}
        isOwnProfile={isCurrentUser}
        userType={profile.userType}
      />
    </div>
  );
};

export default UnifiedProfileView;
