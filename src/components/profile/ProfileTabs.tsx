
import React from 'react';
import { Grid, MessageSquare, BarChart3 } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  posts: string[];
  reviews: Review[];
  analyticsComponent?: React.ReactNode;
}

const ProfileTabs = ({ activeTab, setActiveTab, posts, reviews, analyticsComponent }: ProfileTabsProps) => {
  return (
    <div className="w-full">
      <div className="flex gap-8 mb-4 justify-center">
        <button
          onClick={() => setActiveTab('posts')}
          className="flex flex-col items-center gap-1 text-gray-700"
        >
          <Grid size={20} />
          <span className="text-sm font-medium">Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className="flex flex-col items-center gap-1 text-gray-700"
        >
          <MessageSquare size={20} />
          <span className="text-sm font-medium">Reviews</span>
        </button>
        {analyticsComponent && (
          <button
            onClick={() => setActiveTab('analytics')}
            className="flex flex-col items-center gap-1 text-gray-700"
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
              <div key={index} className="aspect-square">
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
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.author}</span>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-sm text-gray-700">{review.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && analyticsComponent && (
          <div>
            {analyticsComponent}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
