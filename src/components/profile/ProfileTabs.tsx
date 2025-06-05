
import React from 'react';
import { Grid, MessageSquare, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewsSection from './ReviewsSection';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
  verified: boolean;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  posts: string[];
  reviews: Review[];
  analyticsComponent?: React.ReactNode;
  isOwnProfile?: boolean;
  userType?: string;
}

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  posts, 
  reviews, 
  analyticsComponent,
  isOwnProfile,
  userType 
}: ProfileTabsProps) => {
  const navigate = useNavigate();

  const handlePostClick = (postIndex: number) => {
    navigate(`/post/${postIndex + 1}`);
  };

  return (
    <div className="w-full">
      <div className="flex gap-8 mb-4 justify-center">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'posts' ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <Grid size={20} />
          <span className="text-sm font-medium">Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'reviews' ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-sm font-medium">Reviews</span>
        </button>
        {isOwnProfile && analyticsComponent && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'analytics' ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, index) => (
              <div 
                key={index} 
                className="aspect-square cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => handlePostClick(index)}
              >
                <img
                  src={post}
                  alt={`Post ${index + 1}`}
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsSection reviews={reviews} userType={userType} />
        )}

        {activeTab === 'analytics' && isOwnProfile && analyticsComponent && (
          <div>
            {analyticsComponent}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
