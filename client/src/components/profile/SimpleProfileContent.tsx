
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Heart,
  MessageSquare,
  Share2,
  Flag,
  Edit,
  Camera,
  Award,
  Shield,
  Users,
  Eye
} from 'lucide-react';
import ProfileBadges from './ProfileBadges';

interface SimpleProfileContentProps {
  profile: {
    id: string;
    full_name: string;
    username: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    user_type: 'buyer' | 'breeder' | 'shelter' | 'admin';
    verified: boolean;
    years_experience: number;
    rating: number;
    total_reviews: number;
    created_at: string;
    professional_status?: 'standard' | 'professional' | 'verified_professional';
    specializations?: string[];
    certifications?: string[];
  };
  verificationBadges?: Array<{
    badge_type: string;
    badge_name: string;
    is_active: boolean;
  }>;
  isOwnProfile?: boolean;
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
}

const SimpleProfileContent = ({ 
  profile, 
  verificationBadges = [], 
  isOwnProfile = false,
  subscriptionTier = 'basic'
}: SimpleProfileContentProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const memberSince = new Date(profile.created_at).getFullYear();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                {profile.verified && (
                  <Shield className="h-5 w-5 text-blue-600" />
                )}
              </div>
              
              <p className="text-gray-600">@{profile.username}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
                {profile.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{profile.rating}/5 ({profile.total_reviews} reviews)</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-700 mt-3">{profile.bio}</p>
              )}

              {/* Profile Badges */}
              <ProfileBadges
                verificationBadges={verificationBadges.map(badge => badge.badge_name)}
                specializations={profile.specializations || []}
                certifications={profile.certifications || []}
                userId={profile.id}
                userType={profile.user_type}
                professionalStatus={profile.professional_status}
                subscriptionTier={subscriptionTier}
              />
            </div>

            <div className="flex flex-col space-y-2">
              {!isOwnProfile ? (
                <>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </>
              ) : (
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-gray-500">Followers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-gray-500">Following</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">1.2K</div>
            <div className="text-sm text-gray-500">Profile Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-gray-500">Listings</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No recent activity to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No active listings to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No reviews to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {profile.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.user_type === 'breeder' && (
                <div>
                  <h4 className="font-medium text-gray-900">Experience</h4>
                  <p className="text-gray-600">{profile.years_experience} years in breeding</p>
                </div>
              )}
              
              {profile.specializations && profile.specializations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.certifications && profile.certifications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleProfileContent;
