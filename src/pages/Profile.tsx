
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBadges from '@/components/profile/ProfileBadges';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHighlights from '@/components/profile/ProfileHighlights';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';

const Profile = () => {
  const { userId } = useParams();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Check if this is the current user's profile or another user's profile
  const isOwnProfile = !userId || userId === user?.id;
  
  // Use current user's profile data or create a default profile structure
  const displayProfile = isOwnProfile && profile ? {
    id: profile.id,
    name: profile.fullName || 'User',
    username: profile.username ? `@${profile.username}` : '@user',
    location: profile.location || 'Location not set',
    bio: profile.bio || 'Bio not added yet',
    avatar: profile.avatarUrl || "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    followers: 0, // These would come from separate tables in a real app
    following: 0,
    posts: 0,
    verified: profile.verified || false,
    isBreeder: profile.userType === 'breeder',
    verificationBadges: profile.verified ? ['ID Verified'] : [],
    rating: profile.rating || 0,
    totalReviews: profile.totalReviews || 0,
    yearsExperience: profile.yearsExperience || 0,
    specializations: [], // This would be a separate field
    contactInfo: {
      phone: profile.phone || '',
      email: user?.email || '',
      website: profile.websiteUrl || ''
    },
    certifications: [] // This would be a separate field
  } : {
    // Default profile for non-logged in users or other users
    id: userId || 'unknown',
    name: "Golden Paws Kennel",
    username: "@goldenpaws",
    location: "San Francisco, CA",
    bio: "Specializing in Golden Retrievers and Labradors for over 15 years. All our puppies are health tested and come with health guarantees.",
    avatar: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    followers: 1248,
    following: 342,
    posts: 47,
    verified: true,
    isBreeder: true,
    verificationBadges: ['ID Verified', 'Licensed Breeder', 'Vet Reviewed'],
    rating: 4.9,
    totalReviews: 156,
    yearsExperience: 15,
    specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'contact@goldenpaws.com',
      website: 'www.goldenpaws.com'
    },
    certifications: [
      'AKC Registered Breeder',
      'USDA Licensed',
      'Veterinary Health Certificate'
    ]
  };

  const highlights = [
    {
      id: 'new',
      title: 'New',
      cover: '',
      isNew: true
    },
    {
      id: 1,
      title: 'Puppies',
      cover: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      title: 'Training',
      cover: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      title: 'Health',
      cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      title: 'Reviews',
      cover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop'
    }
  ];

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Amazing experience! Our Golden Retriever puppy is healthy, well-socialized, and came with all health records. Highly recommend!"
    },
    {
      id: 2,
      author: "Mike D.",
      rating: 5,
      date: "1 month ago",
      text: "Professional breeder with excellent facilities. The puppy training they provide is exceptional."
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium text-black">{displayProfile.username}</h1>
          {isOwnProfile && (
            <button 
              onClick={() => setIsEditDialogOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings size={24} className="text-black" />
            </button>
          )}
        </div>

        <ProfileHeader profile={displayProfile} />
        
        <ProfileBadges 
          verificationBadges={displayProfile.verificationBadges}
          specializations={displayProfile.specializations}
        />

        <ProfileActions />

        <ProfileHighlights highlights={highlights} />

        <ProfileTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          posts={posts}
          reviews={reviews}
        />
      </div>

      {isEditDialogOpen && (
        <ProfileEditDialog 
          profile={profile}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
