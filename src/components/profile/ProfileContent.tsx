
import React, { useState } from 'react';
import { Settings, Star, Crown, Zap, UserPlus, Sparkles, Grid3X3, MoreHorizontal, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ProfileHeaderWithPresence from '@/components/profile/ProfileHeaderWithPresence';
import ProfileBadges from '@/components/profile/ProfileBadges';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';
import ProfileCompletionGuideEnhanced from '@/components/profile/ProfileCompletionGuideEnhanced';
import MobileProfileHeader from '@/components/profile/MobileProfileHeader';
import ProfileAnalyticsEnhanced from '@/components/profile/ProfileAnalyticsEnhanced';
import OnlineUsersList from '@/components/ui/online-users-list';
import ProfilePhotoGrid from '@/components/profile/ProfilePhotoGrid';
import { UserProfile } from '@/types/profile';

interface ProfileContentProps {
  displayProfile: UserProfile;
  isOwnProfile: boolean;
  isMobile: boolean;
  user: any;
  profile: any;
  verificationBadges: any[];
}

const ProfileContent = ({ 
  displayProfile, 
  isOwnProfile, 
  isMobile, 
  user, 
  profile,
  verificationBadges 
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCompletionGuide, setShowCompletionGuide] = useState(true);
  const navigate = useNavigate();
  const isGuestUser = !user;

  console.log('ProfileContent render:', {
    displayProfile: !!displayProfile,
    isOwnProfile,
    isMobile,
    hasUser: !!user,
    hasProfile: !!profile,
    isGuestUser
  });

  const handleStepClick = (stepId: string) => {
    // Only allow step clicks if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    switch (stepId) {
      case 'basic_info':
      case 'profile_photo':
        setIsEditDialogOpen(true);
        break;
      case 'verification':
        window.location.href = '/verification';
        break;
      default:
        setIsEditDialogOpen(true);
    }
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${displayProfile.full_name || displayProfile.username || 'User'}'s Profile`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleViewPublic = () => {
    // Toggle to public view
    console.log('View public profile');
  };

  // Add verification badges from enhanced system
  const allVerificationBadges = verificationBadges.length > 0 
    ? verificationBadges.map(badge => badge.badge_name)
    : displayProfile.verification_badges?.map(badge => badge.type) || [];

  console.log('ProfileContent: About to render components');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Profile Header with Clear Action Buttons */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Profile Info Section */}
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {displayProfile.avatar_url ? (
                <img 
                  src={displayProfile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (displayProfile.full_name || displayProfile.username || 'U')?.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayProfile.full_name || displayProfile.username || 'User'}
                  </h1>
                  {displayProfile.username && (
                    <p className="text-gray-600">@{displayProfile.username}</p>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center space-x-3">
                  {isOwnProfile ? (
                    <>
                      <Button
                        onClick={handleShareProfile}
                        variant="outline"
                        size="sm"
                        className="border-2 transition-all duration-200 hover:shadow-md"
                        style={{ 
                          borderColor: '#2363FF',
                          color: '#2363FF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E5EEFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share Profile
                      </Button>
                      <Button
                        onClick={handleViewPublic}
                        variant="outline"
                        size="sm"
                        className="border-2 transition-all duration-200 hover:shadow-md"
                        style={{ 
                          borderColor: '#2363FF',
                          color: '#2363FF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E5EEFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        View Public
                      </Button>
                      <Button
                        onClick={() => navigate('/settings')}
                        variant="outline"
                        size="sm"
                        className="border-2 transition-all duration-200 hover:shadow-md"
                        style={{ 
                          borderColor: '#2363FF',
                          color: '#2363FF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E5EEFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="transition-all duration-200"
                        style={{ backgroundColor: '#2363FF' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1E52D0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2363FF';
                        }}
                      >
                        Follow
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2"
                        style={{ 
                          borderColor: '#2363FF',
                          color: '#2363FF'
                        }}
                      >
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">156</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center cursor-pointer hover:opacity-80">
                  <div className="text-xl font-bold text-gray-900">2.5K</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center cursor-pointer hover:opacity-80">
                  <div className="text-xl font-bold text-gray-900">1.2K</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              {/* Bio */}
              {displayProfile.bio && (
                <p className="text-gray-700 mb-4">{displayProfile.bio}</p>
              )}

              {/* Verification Badges */}
              {allVerificationBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allVerificationBadges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: '#E5EEFF',
                        color: '#2363FF'
                      }}
                    >
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            {['Photos', 'Reviews', 'About'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4 inline mr-2" />
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'photos' && (
          <ProfilePhotoGrid 
            isOwnProfile={isOwnProfile}
            photos={[
              { id: '1', url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop' },
              { id: '2', url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop' },
              { id: '3', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop' },
              { id: '4', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop' },
              { id: '5', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop' },
              { id: '6', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop' }
            ]}
          />
        )}
        
        {activeTab === 'reviews' && (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Reviews from customers will appear here.</p>
          </div>
        )}
        
        {activeTab === 'about' && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <p className="text-gray-600">{displayProfile.email}</p>
                  {displayProfile.phone && (
                    <p className="text-gray-600">{displayProfile.phone}</p>
                  )}
                </div>
                {displayProfile.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">{displayProfile.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default ProfileContent;
