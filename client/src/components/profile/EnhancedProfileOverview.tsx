
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Star, 
  MapPin, 
  Calendar, 
  Award,
  Users,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';

interface EnhancedProfileOverviewProps {
  profile: {
    id: string;
    full_name: string;
    username: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    user_type: string;
    verified: boolean;
    trust_score: number;
    verification_level: number;
    profile_completion_percentage: number;
    breeding_program_name?: string;
    specializations: string[];
    certifications: string[];
    years_experience: number;
    rating: number;
    total_reviews: number;
    created_at: string;
  };
  verificationBadges: Array<{
    badge_type: string;
    badge_name: string;
    is_active: boolean;
  }>;
  stats?: {
    followers: number;
    following: number;
    views: number;
    likes: number;
  };
  isOwnProfile?: boolean;
}

const EnhancedProfileOverview = ({ 
  profile, 
  verificationBadges, 
  stats,
  isOwnProfile = false 
}: EnhancedProfileOverviewProps) => {
  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Needs Improvement';
  };

  const memberSince = new Date(profile.created_at).getFullYear();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                {profile.verified && (
                  <Shield className="h-5 w-5 text-blue-600" />
                )}
              </div>
              
              <p className="text-gray-600">@{profile.username}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mt-3">{profile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score & Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Trust Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getTrustScoreColor(profile.trust_score)}`}>
                  {(profile.trust_score * 100).toFixed(0)}%
                </span>
                <Badge variant="outline">
                  {getTrustScoreLabel(profile.trust_score)}
                </Badge>
              </div>
              <Progress value={profile.trust_score * 100} className="w-full" />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{profile.rating}/5 avg rating</span>
                <span>{profile.total_reviews} reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Verification Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verification Level</span>
                <Badge variant="secondary">
                  Level {profile.verification_level}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {verificationBadges.filter(badge => badge.is_active).map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge.badge_name}
                  </Badge>
                ))}
                {verificationBadges.filter(badge => badge.is_active).length === 0 && (
                  <span className="text-sm text-gray-500">No verifications yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Info (for breeders) */}
      {profile.user_type === 'breeder' && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.breeding_program_name && (
              <div>
                <h4 className="font-medium text-gray-900">Breeding Program</h4>
                <p className="text-gray-600">{profile.breeding_program_name}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900">Experience</h4>
              <p className="text-gray-600">{profile.years_experience} years</p>
            </div>

            {profile.specializations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Completion (own profile only) */}
      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {profile.profile_completion_percentage}% Complete
                </span>
                <span className="text-sm text-gray-500">
                  {profile.profile_completion_percentage < 80 ? 'Almost there!' : 'Well done!'}
                </span>
              </div>
              <Progress value={profile.profile_completion_percentage} className="w-full" />
              <p className="text-xs text-gray-500">
                Complete your profile to improve visibility and trust
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{stats.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{stats.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{stats.views}</div>
                <div className="text-sm text-gray-500">Profile Views</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold">{stats.likes}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProfileOverview;
