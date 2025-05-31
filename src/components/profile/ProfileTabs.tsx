
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, MessageSquare, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/reviews/StarRating';

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex flex-col items-center py-3 text-sm ${
            activeTab === 'posts' 
              ? 'text-black' 
              : 'text-gray-400'
          }`}
        >
          <Grid size={20} className="mb-1" />
          POSTS
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 flex flex-col items-center py-3 text-sm ${
            activeTab === 'reviews' 
              ? 'text-black' 
              : 'text-gray-400'
          }`}
        >
          <MessageSquare size={20} className="mb-1" />
          REVIEWS
        </button>
        {analyticsComponent && (
          <Button
            onClick={() => setActiveTab('analytics')}
            className="flex-1 bg-blue-500 text-white"
          >
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </Button>
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
                    <StarRating rating={review.rating} size="sm" />
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
    </Tabs>
  );
};

export default ProfileTabs;
